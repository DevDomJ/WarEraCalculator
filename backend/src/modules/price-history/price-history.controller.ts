import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Controller('prices')
export class PriceHistoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':itemCode')
  async getPriceHistory(
    @Param('itemCode') itemCode: string,
    @Query('days') days?: string,
  ) {
    const daysAgo = parseInt(days || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const history = await this.prisma.priceHistory.findMany({
      where: {
        itemCode,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    });

    return history;
  }

  @Get(':itemCode/orders')
  async getCurrentOrders(@Param('itemCode') itemCode: string) {
    const latestTimestamp = await this.prisma.tradingOrder.findFirst({
      where: { itemCode },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    if (!latestTimestamp) return { buyOrders: [], sellOrders: [] };

    const buyOrders = await this.prisma.tradingOrder.findMany({
      where: {
        itemCode,
        timestamp: latestTimestamp.timestamp,
        type: 'buy',
      },
      orderBy: { price: 'desc' },
    });

    const sellOrders = await this.prisma.tradingOrder.findMany({
      where: {
        itemCode,
        timestamp: latestTimestamp.timestamp,
        type: 'sell',
      },
      orderBy: { price: 'asc' },
    });

    return { buyOrders, sellOrders };
  }
}
