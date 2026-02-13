import { Module, forwardRef } from '@nestjs/common';
import { ProductionCalculatorService } from './production-calculator.service';
import { ProductionCalculatorController } from './production-calculator.controller';
import { CompanyModule } from '../company/company.module';
import { GameConfigModule } from '../game-config/game-config.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [forwardRef(() => CompanyModule), GameConfigModule],
  controllers: [ProductionCalculatorController],
  providers: [ProductionCalculatorService, PrismaService],
  exports: [ProductionCalculatorService],
})
export class ProductionCalculatorModule {}
