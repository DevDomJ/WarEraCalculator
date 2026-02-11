import { Module } from '@nestjs/common';
import { TradingOrderService } from './trading-order.service';
import { WarEraApiModule } from '../warera-api/warera-api.module';
import { GameConfigModule } from '../game-config/game-config.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [WarEraApiModule, GameConfigModule],
  providers: [TradingOrderService, PrismaService],
  exports: [TradingOrderService],
})
export class TradingOrderModule {}
