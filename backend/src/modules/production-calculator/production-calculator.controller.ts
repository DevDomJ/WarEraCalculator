import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductionCalculatorService, ProductionMetrics, ProfitScenario, Recipe } from './production-calculator.service';
import { parseFloatParam, parseIntParam } from '../../common/parse-query';

@Controller('production')
export class ProductionCalculatorController {
  constructor(private readonly calculatorService: ProductionCalculatorService) {}

  @Get('recipes')
  async getRecipes(): Promise<Recipe[]> {
    return this.calculatorService.getRecipes();
  }

  @Get(':companyId/metrics')
  getProductionMetrics(
    @Param('companyId') companyId: string,
    @Query('productionBonus') productionBonus?: string,
    @Query('fidelityBonus') fidelityBonus?: string,
    @Query('maxEnergy') maxEnergy?: string,
  ) {
    return this.calculatorService.calculateProductionMetrics(
      { companyId } as any,
      parseFloatParam(productionBonus, { default: 0, min: 0, max: 10 }),
      parseFloatParam(fidelityBonus, { default: 0, min: 0, max: 10 }),
      parseIntParam(maxEnergy, { default: 70, min: 1, max: 200 }),
    );
  }

  @Get(':companyId/profit')
  async calculateProfit(
    @Param('companyId') companyId: string,
    @Query('outputItem') outputItem: string,
    @Query('productionBonus') productionBonus?: string,
  ) {
    return this.calculatorService.calculateProfitScenarios(
      companyId,
      outputItem,
      parseFloatParam(productionBonus, { default: 0.2, min: 0, max: 10 }),
    );
  }
}
