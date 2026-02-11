import { Module } from '@nestjs/common';
import { GameConfigService } from './game-config.service';
import { WarEraApiModule } from '../warera-api/warera-api.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [WarEraApiModule],
  providers: [GameConfigService, PrismaService],
  exports: [GameConfigService],
})
export class GameConfigModule {}
