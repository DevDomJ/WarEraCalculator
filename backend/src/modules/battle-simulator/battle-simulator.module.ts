import { Module } from '@nestjs/common';
import { BattleSimulatorController } from './battle-simulator.controller';
import { BattleSimulatorService } from './battle-simulator.service';
import { WarEraApiModule } from '../warera-api/warera-api.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [WarEraApiModule],
  controllers: [BattleSimulatorController],
  providers: [BattleSimulatorService, PrismaService],
})
export class BattleSimulatorModule {}
