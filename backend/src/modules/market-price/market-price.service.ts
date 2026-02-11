import { Injectable, Logger } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MarketPriceService {
  private readonly logger = new Logger(MarketPriceService.name);

  constructor(
    private readonly apiService: WarEraApiService,
    private readonly prisma: PrismaService,
  ) {}

  async fetchAndStorePrices(): Promise<void> {
    try {
      this.logger.log('Fetching market prices...');
      const response = await this.apiService.request<any>('itemTrading.getPrices');
      
      if (response?.result?.data) {
        const prices = response.result.data;
        const timestamp = new Date();
        
        for (const [itemCode, price] of Object.entries(prices)) {
          if (typeof price === 'number') {
            // Get current top orders to calculate volume and best prices
            const orders = await this.prisma.tradingOrder.findMany({
              where: { itemCode },
              orderBy: { timestamp: 'desc' },
              take: 10,
            });

            const buyOrders = orders.filter(o => o.type === 'buy');
            const sellOrders = orders.filter(o => o.type === 'sell');
            
            const volume = orders.reduce((sum, o) => sum + o.quantity, 0);
            const highestBuy = buyOrders.length > 0 ? Math.max(...buyOrders.map(o => o.price)) : null;
            const lowestSell = sellOrders.length > 0 ? Math.min(...sellOrders.map(o => o.price)) : null;

            await this.prisma.priceHistory.create({
              data: {
                itemCode,
                price,
                timestamp,
              },
            });
          }
        }
        
        this.logger.log(`Stored prices for ${Object.keys(prices).length} items`);
      }
    } catch (error) {
      this.logger.error('Failed to fetch market prices', error);
    }
  }
}
