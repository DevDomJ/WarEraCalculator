import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { RegionBonusService } from './region-bonus.service';

@Controller('recommendations')
export class RegionBonusController {
  constructor(private readonly regionBonusService: RegionBonusService) {}

  @Get()
  async getAll(@Query('engineLevel') engineLevel?: string) {
    const level = Math.min(Math.max(parseInt(engineLevel || '4', 10) || 4, 1), 7);
    return this.regionBonusService.getAllRecommendations(level);
  }

  @Get(':itemCode')
  async getByItem(
    @Param('itemCode') itemCode: string,
    @Query('engineLevel') engineLevel?: string,
  ) {
    const level = Math.min(Math.max(parseInt(engineLevel || '4', 10) || 4, 1), 7);
    const result = await this.regionBonusService.getItemRecommendation(itemCode, level);
    if (!result) throw new NotFoundException(`No recommendation found for item: ${itemCode}`);
    return result;
  }
}
