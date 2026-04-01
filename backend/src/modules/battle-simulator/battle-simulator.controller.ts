import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { BattleSimulatorService } from './battle-simulator.service';
import { SimulateDto, CompareDto } from './battle-simulator.dto';

@Controller('battle-sim')
export class BattleSimulatorController {
  constructor(private readonly battleSim: BattleSimulatorService) {}

  @Get('user-skills/:userId')
  async getUserSkills(@Param('userId') userId: string) {
    return this.battleSim.getUserSkills(userId);
  }

  @Post('simulate')
  async simulate(@Body() req: SimulateDto) {
    return this.battleSim.simulate(req);
  }

  @Post('compare')
  async compare(@Body() req: CompareDto) {
    return this.battleSim.compareBuilds(req.builds, {
      militaryRank: req.militaryRank,
      militaryRankPercent: req.militaryRankPercent,
      duration: req.duration,
      bountyPer1kDmg: req.bountyPer1kDmg,
      battleBonusPercent: req.battleBonusPercent,
      seed: req.seed,
    });
  }
}
