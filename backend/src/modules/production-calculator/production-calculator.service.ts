import { Injectable, Logger } from '@nestjs/common';
import { CompanyService, CompanyData } from '../company/company.service';
import { GameConfigService } from '../game-config/game-config.service';
import { PrismaService } from '../../prisma.service';

export interface Recipe {
  output: string;
  productionPoints: number;
  inputs: Array<{ itemCode: string; quantityRequired: number }>;
}

export interface ProductionMetrics {
  productionPointsPerWork: number;
  workActionsPerDay: number;
  totalProductionPointsPerDay: number;
  formula: {
    ppPerWork: string;
    actionsPerDay: string;
    totalPP: string;
  };
}

export interface ProfitScenario {
  revenue: number;
  costs: number;
  profit: number;
  profitPerPP: number;
  breakdown: any;
}

@Injectable()
export class ProductionCalculatorService {
  private readonly logger = new Logger(ProductionCalculatorService.name);

  constructor(
    private readonly companyService: CompanyService,
    private readonly gameConfigService: GameConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getRecipes(): Promise<Recipe[]> {
    const items = await this.gameConfigService.getItems();
    const recipes: Recipe[] = [];

    for (const item of items) {
      if (item.productionNeeds) {
        const inputs = Object.entries(item.productionNeeds).map(([itemCode, quantity]) => ({
          itemCode,
          quantityRequired: quantity as number,
        }));

        recipes.push({
          output: item.code,
          productionPoints: item.productionPoints || 0,
          inputs,
        });
      }
    }

    return recipes;
  }

  calculateProductionMetrics(
    company: CompanyData,
    productionBonus: number = 0,
    fidelityBonus: number = 0,
    maxEnergy: number = 70,
  ): ProductionMetrics {
    const ppPerWork = company.productionValue * (1 + productionBonus + fidelityBonus);
    const actionsPerDay = maxEnergy * 0.24;
    const totalPP = actionsPerDay * ppPerWork;

    return {
      productionPointsPerWork: ppPerWork,
      workActionsPerDay: actionsPerDay,
      totalProductionPointsPerDay: totalPP,
      formula: {
        ppPerWork: `${company.productionValue} × (1 + ${productionBonus} + ${fidelityBonus}) = ${ppPerWork}`,
        actionsPerDay: `${maxEnergy} × 0.24 = ${actionsPerDay}`,
        totalPP: `${actionsPerDay} × ${ppPerWork} = ${totalPP}`,
      },
    };
  }

  async calculateProfitScenarios(
    companyId: string,
    outputItemCode: string,
    productionBonus: number = 0.2,
  ): Promise<{ scenarioA: ProfitScenario; scenarioB: ProfitScenario | null }> {
    const company = await this.companyService.getCompanyById(companyId);
    if (!company) throw new Error('Company not found');

    const recipes = await this.getRecipes();
    const recipe = recipes.find(r => r.output === outputItemCode);
    
    // Handle raw materials (no recipe, only production points)
    if (!recipe) {
      const items = await this.gameConfigService.getItems();
      const item = items.find(i => i.code === outputItemCode);
      if (!item?.productionPoints) {
        throw new Error('Item not found or has no production data');
      }
      
      return this.calculateRawMaterialProfit(company, item, productionBonus);
    }

    const metrics = this.calculateProductionMetrics(company, productionBonus);
    const outputPrice = await this.getLatestPrice(outputItemCode);
    
    const workers = company.workers || [];
    // Each worker regenerates 10% of max energy per hour = 2.4 * maxEnergy per day
    // Worker produces: energy * (production / 10) production points per day (without bonuses)
    // Worker is paid: wage * production points (wage is per PP)
    const totalDailyWage = workers.reduce((sum, w) => {
      const maxEnergy = w.maxEnergy || 70;
      const production = w.production || 0;
      const energyPerDay = maxEnergy * 0.1 * 24; // 10% regen per hour * 24 hours
      const ppPerDay = (energyPerDay / 10) * production; // 10 energy per work action
      return sum + (w.wage * ppPerDay);
    }, 0);
    const wagePerPP = totalDailyWage / metrics.totalProductionPointsPerDay;

    // Calculate how many items produced per PP
    const outputPerPP = recipe.productionPoints > 0 ? 1 / recipe.productionPoints : 0;

    // Scenario A: Buy inputs from market
    const inputCosts = await Promise.all(
      recipe.inputs.map(async (input) => {
        const price = await this.getLatestPrice(input.itemCode);
        return price * input.quantityRequired;
      })
    );
    const totalInputCost = inputCosts.reduce((sum, cost) => sum + cost, 0);

    const scenarioA: ProfitScenario = {
      revenue: outputPrice * outputPerPP,
      costs: totalInputCost + wagePerPP,
      profit: 0,
      profitPerPP: 0,
      breakdown: {
        outputPrice,
        outputPerPP,
        productionBonus,
        inputCosts: recipe.inputs.map((input, i) => ({
          itemCode: input.itemCode,
          quantity: input.quantityRequired,
          cost: inputCosts[i],
        })),
        wagePerPP,
      },
    };
    scenarioA.profit = scenarioA.revenue - scenarioA.costs;
    scenarioA.profitPerPP = scenarioA.profit;

    // Scenario B: Self-production (if inputs have recipes)
    let scenarioB: ProfitScenario | null = null;
    const hasInputRecipes = recipe.inputs.every(input => recipes.some(r => r.output === input.itemCode));
    
    if (hasInputRecipes) {
      // Simplified: Calculate cost of producing inputs
      const inputProductionCosts = await Promise.all(
        recipe.inputs.map(async (input) => {
          const inputRecipe = recipes.find(r => r.output === input.itemCode);
          if (!inputRecipe) return 0;
          
          const inputPrice = await this.getLatestPrice(input.itemCode);
          return inputPrice * input.quantityRequired * 0.8; // Assume 20% savings
        })
      );
      const totalInputProductionCost = inputProductionCosts.reduce((sum, cost) => sum + cost, 0);

      scenarioB = {
        revenue: outputPrice * outputPerPP,
        costs: totalInputProductionCost + wagePerPP,
        profit: 0,
        profitPerPP: 0,
        breakdown: {
          outputPrice,
          outputPerPP,
          productionBonus,
          inputProductionCosts: recipe.inputs.map((input, i) => ({
            itemCode: input.itemCode,
            quantity: input.quantityRequired,
            cost: inputProductionCosts[i],
          })),
          wagePerPP,
        },
      };
      scenarioB.profit = scenarioB.revenue - scenarioB.costs;
      scenarioB.profitPerPP = scenarioB.profit;
    }

    return { scenarioA, scenarioB };
  }

  private async calculateRawMaterialProfit(
    company: any,
    item: any,
    productionBonus: number,
  ): Promise<{ scenarioA: ProfitScenario; scenarioB: ProfitScenario | null }> {
    const metrics = this.calculateProductionMetrics(company, productionBonus);
    const outputPrice = await this.getLatestPrice(item.code);
    
    const workers = company.workers || [];
    const totalDailyWage = workers.reduce((sum, w) => sum + w.wage, 0);
    const wagePerPP = totalDailyWage / metrics.totalProductionPointsPerDay;
    
    const outputPerPP = item.productionPoints > 0 ? 1 / item.productionPoints : 0;
    
    const scenarioA: ProfitScenario = {
      revenue: outputPrice * outputPerPP,
      costs: wagePerPP,
      profit: 0,
      profitPerPP: 0,
      breakdown: {
        outputPrice,
        outputPerPP,
        productionBonus,
        inputCosts: [],
        wagePerPP,
      },
    };
    scenarioA.profit = scenarioA.revenue - scenarioA.costs;
    scenarioA.profitPerPP = scenarioA.profit;
    
    return { scenarioA, scenarioB: null };
  }

  private async getLatestPrice(itemCode: string): Promise<number> {
    const price = await this.prisma.priceHistory.findFirst({
      where: { itemCode },
      orderBy: { timestamp: 'desc' },
    });
    return price?.price || 0;
  }
}
