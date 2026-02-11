import { Module } from '@nestjs/common';
import { PriceHistoryController } from './price-history.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PriceHistoryController],
  providers: [PrismaService],
})
export class PriceHistoryModule {}
