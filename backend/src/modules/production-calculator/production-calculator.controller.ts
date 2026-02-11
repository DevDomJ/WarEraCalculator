import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductionCalculatorService, ProductionMetrics, ProfitScenario, Recipe } from './production-calculator.service';

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
      parseFloat(productionBonus || '0'),
      parseFloat(fidelityBonus || '0'),
      parseInt(maxEnergy || '70'),
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
      parseFloat(productionBonus || '0.2'),
    );
  }
}
