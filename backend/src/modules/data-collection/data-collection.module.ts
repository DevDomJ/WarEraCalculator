import { Module } from '@nestjs/common';
import { DataCollectionService } from './data-collection.service';
import { DataCollectionController } from './data-collection.controller';
import { GameConfigModule } from '../game-config/game-config.module';
import { MarketPriceModule } from '../market-price/market-price.module';
import { TradingOrderModule } from '../trading-order/trading-order.module';

@Module({
  imports: [GameConfigModule, MarketPriceModule, TradingOrderModule],
  controllers: [DataCollectionController],
  providers: [DataCollectionService],
})
export class DataCollectionModule {}
