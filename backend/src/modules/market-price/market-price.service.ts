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
