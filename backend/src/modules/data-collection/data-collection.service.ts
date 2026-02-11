import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GameConfigService } from '../game-config/game-config.service';
import { MarketPriceService } from '../market-price/market-price.service';
import { TradingOrderService } from '../trading-order/trading-order.service';

@Injectable()
export class DataCollectionService {
  private readonly logger = new Logger(DataCollectionService.name);

  constructor(
    private readonly gameConfig: GameConfigService,
    private readonly marketPrice: MarketPriceService,
    private readonly tradingOrder: TradingOrderService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async collectData() {
    await this.runCollection();
  }

  async runCollection() {
    this.logger.log('Starting data collection cycle...');
    
    try {
      await this.gameConfig.fetchAndCacheGameConfig();
      await this.marketPrice.fetchAndStorePrices();
      await this.tradingOrder.fetchAndStoreOrders();
      
      this.logger.log('Data collection completed successfully');
    } catch (error) {
      this.logger.error('Data collection failed', error);
      throw error;
    }
  }
}
