import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ProductionAnalyticsService } from './production-analytics.service';
import { parseIntParam } from '../../common/parse-query';

@Controller('analytics')
export class ProductionAnalyticsController {
  constructor(private readonly analyticsService: ProductionAnalyticsService) {}

  @Post(':companyId/track')
  async trackProduction(
    @Param('companyId') companyId: string,
    @Body('actualPP') actualPP: number,
    @Body('expectedPP') expectedPP: number,
  ) {
    await this.analyticsService.trackProduction(companyId, actualPP, expectedPP);
    return { success: true };
  }

  @Get(':companyId/history')
  async getHistory(
    @Param('companyId') companyId: string,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getProductionHistory(
      companyId,
      parseIntParam(days, { default: 30, min: 1, max: 365 }),
    );
  }

  @Get(':companyId')
  async getAnalytics(
    @Param('companyId') companyId: string,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getAnalytics(
      companyId,
      parseIntParam(days, { default: 30, min: 1, max: 365 }),
    );
  }
}
