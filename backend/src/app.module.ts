import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from './prisma.service';
import { WarEraApiModule } from './modules/warera-api/warera-api.module';
import { GameConfigModule } from './modules/game-config/game-config.module';
import { MarketPriceModule } from './modules/market-price/market-price.module';
import { TradingOrderModule } from './modules/trading-order/trading-order.module';
import { ItemsModule } from './modules/items/items.module';
import { PriceHistoryModule } from './modules/price-history/price-history.module';
import { DataCollectionModule } from './modules/data-collection/data-collection.module';
import { CompanyModule } from './modules/company/company.module';
import { ProductionCalculatorModule } from './modules/production-calculator/production-calculator.module';
import { ProductionAnalyticsModule } from './modules/production-analytics/production-analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HttpModule,
    WarEraApiModule,
    GameConfigModule,
    MarketPriceModule,
    TradingOrderModule,
    ItemsModule,
    PriceHistoryModule,
    DataCollectionModule,
    CompanyModule,
    ProductionCalculatorModule,
    ProductionAnalyticsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
