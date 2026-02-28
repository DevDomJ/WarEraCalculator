import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ProductionCalculatorService, ProductionMetrics, ProfitScenario, Recipe } from './production-calculator.service';
import { CompanyService } from '../company/company.service';
import { parseFloatParam, parseIntParam } from '../../common/parse-query';

@Controller('production')
export class ProductionCalculatorController {
  constructor(
    private readonly calculatorService: ProductionCalculatorService,
    private readonly companyService: CompanyService,
  ) {}

  @Get('recipes')
  async getRecipes(): Promise<Recipe[]> {
    return this.calculatorService.getRecipes();
  }

  @Get(':companyId/metrics')
  async getProductionMetrics(
    @Param('companyId') companyId: string,
    @Query('productionBonus') productionBonus?: string,
    @Query('fidelityBonus') fidelityBonus?: string,
    @Query('maxEnergy') maxEnergy?: string,
  ) {
    const productionValue = await this.companyService.getCompanyProductionValue(companyId);
    if (productionValue === null) throw new NotFoundException('Company not found');

    return this.calculatorService.calculateProductionMetrics(
      productionValue,
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
