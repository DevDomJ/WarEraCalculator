import { Module } from '@nestjs/common';
import { ProductionAnalyticsService } from './production-analytics.service';
import { ProductionAnalyticsController } from './production-analytics.controller';
import { CompanyModule } from '../company/company.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [CompanyModule],
  controllers: [ProductionAnalyticsController],
  providers: [ProductionAnalyticsService, PrismaService],
  exports: [ProductionAnalyticsService],
})
export class ProductionAnalyticsModule {}
