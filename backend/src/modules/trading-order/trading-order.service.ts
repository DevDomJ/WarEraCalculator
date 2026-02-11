import { Injectable, Logger } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';
import { GameConfigService } from '../game-config/game-config.service';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TradingOrderService {
  private readonly logger = new Logger(TradingOrderService.name);

  constructor(
    private readonly apiService: WarEraApiService,
    private readonly gameConfig: GameConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async fetchAndStoreOrders(): Promise<void> {
    try {
      const items = await this.gameConfig.getItems();
      const batchSize = 30;
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await this.fetchBatch(batch.map(item => item.code));
      }
      
      this.logger.log(`Fetched orders for ${items.length} items`);
    } catch (error) {
      this.logger.error('Failed to fetch trading orders', error);
    }
  }

  private async fetchBatch(itemCodes: string[]): Promise<void> {
    const endpoints = itemCodes.map(code => ({
      endpoint: 'tradingOrder.getTopOrders',
      params: { itemCode: code, limit: 5 },
    }));

    try {
      const responses = await this.apiService.batchRequest<any>(endpoints);
      const timestamp = new Date();

      // tRPC batch responses are objects with numbered keys, not arrays
      const responsesArray = Array.isArray(responses) ? responses : Object.values(responses);

      for (let i = 0; i < responsesArray.length; i++) {
        const response = responsesArray[i];
        const itemCode = itemCodes[i];

        if (response?.result?.data) {
          const data = response.result.data;
          
          // Data is an object with buyOrders and sellOrders properties
          const buyOrders = data.buyOrders || [];
          const sellOrders = data.sellOrders || [];
          
          await this.prisma.tradingOrder.deleteMany({
            where: { itemCode, timestamp: { lt: timestamp } },
          });

          for (const order of buyOrders) {
            await this.prisma.tradingOrder.create({
              data: {
                itemCode,
                type: 'buy',
                price: order.price,
                quantity: order.quantity,
                timestamp,
              },
            });
          }

          for (const order of sellOrders) {
            await this.prisma.tradingOrder.create({
              data: {
                itemCode,
                type: 'sell',
                price: order.price,
                quantity: order.quantity,
                timestamp,
              },
            });
          }
        }
      }
    } catch (error) {
      this.logger.error('Batch fetch failed', error);
    }
  }
}
