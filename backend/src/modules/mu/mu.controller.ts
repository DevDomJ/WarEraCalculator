import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { MuService } from './mu.service';

@Controller('mu')
export class MuController {
  constructor(private readonly muService: MuService) {}

  @Get('user/:userId')
  async getUserMus(@Param('userId') userId: string) {
    return this.muService.getUserMusSummary(userId);
  }

  @Get(':muId')
  async getMuDetail(@Param('muId') muId: string) {
    const result = await this.muService.getMuDetail(muId);
    if (!result) throw new NotFoundException('MU not found');
    return result;
  }
}
