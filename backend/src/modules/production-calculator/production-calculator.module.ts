import { Module } from '@nestjs/common';
import { ProductionCalculatorService } from './production-calculator.service';
import { ProductionCalculatorController } from './production-calculator.controller';
import { CompanyModule } from '../company/company.module';
import { GameConfigModule } from '../game-config/game-config.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [CompanyModule, GameConfigModule],
  controllers: [ProductionCalculatorController],
  providers: [ProductionCalculatorService, PrismaService],
})
export class ProductionCalculatorModule {}
