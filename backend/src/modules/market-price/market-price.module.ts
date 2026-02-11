import { Module } from '@nestjs/common';
import { MarketPriceService } from './market-price.service';
import { WarEraApiModule } from '../warera-api/warera-api.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [WarEraApiModule],
  providers: [MarketPriceService, PrismaService],
  exports: [MarketPriceService],
})
export class MarketPriceModule {}
