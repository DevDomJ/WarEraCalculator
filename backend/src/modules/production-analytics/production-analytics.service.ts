import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface ProductionHistoryEntry {
  date: Date;
  actualPP: number;
  expectedPP: number;
  variance: number;
}

export interface ProductionAnalytics {
  averageVariance: number;
  totalActualPP: number;
  totalExpectedPP: number;
  efficiency: number;
  history: ProductionHistoryEntry[];
}

@Injectable()
export class ProductionAnalyticsService {
  private readonly logger = new Logger(ProductionAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async trackProduction(
    companyId: string,
    actualPP: number,
    expectedPP: number,
  ): Promise<void> {
    const variance = ((actualPP - expectedPP) / expectedPP) * 100;
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    await this.prisma.productionHistory.upsert({
      where: {
        companyId_date: { companyId, date },
      },
      update: { actualPP, expectedPP, variance },
      create: { companyId, date, actualPP, expectedPP, variance },
    });

    this.logger.log(`Tracked production for ${companyId}: ${actualPP}/${expectedPP} PP`);
  }

  async getProductionHistory(
    companyId: string,
    days: number = 30,
  ): Promise<ProductionHistoryEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return this.prisma.productionHistory.findMany({
      where: {
        companyId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getAnalytics(companyId: string, days: number = 30): Promise<ProductionAnalytics> {
    const history = await this.getProductionHistory(companyId, days);

    if (history.length === 0) {
      return {
        averageVariance: 0,
        totalActualPP: 0,
        totalExpectedPP: 0,
        efficiency: 0,
        history: [],
      };
    }

    const totalActualPP = history.reduce((sum, h) => sum + h.actualPP, 0);
    const totalExpectedPP = history.reduce((sum, h) => sum + h.expectedPP, 0);
    const averageVariance = history.reduce((sum, h) => sum + h.variance, 0) / history.length;
    const efficiency = (totalActualPP / totalExpectedPP) * 100;

    return {
      averageVariance,
      totalActualPP,
      totalExpectedPP,
      efficiency,
      history,
    };
  }
}
