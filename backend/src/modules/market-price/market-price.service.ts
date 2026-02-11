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
      let response = await this.apiService.request<any>('itemTrading.getPrices');
      
      // Handle batch response format (array)
      if (Array.isArray(response) && response.length > 0) {
        response = response[0];
      }
      
      if (response?.result?.data) {
        const prices = response.result.data;
        this.logger.log(`Processing ${Object.keys(prices).length} prices`);
        const timestamp = new Date();
        
        for (const [itemCode, price] of Object.entries(prices)) {
          if (typeof price === 'number') {
            try {
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
                  volume,
                  highestBuy,
                  lowestSell,
                  timestamp,
                },
              });
            } catch (itemError) {
              this.logger.error(`Failed to store price for ${itemCode}`, itemError);
            }
          }
        }
        
        this.logger.log(`Stored prices for ${Object.keys(prices).length} items`);
      } else {
        this.logger.warn(`No price data in response`);
      }
    } catch (error) {
      this.logger.error('Failed to fetch market prices', error);
      throw error;
    }
  }
}
