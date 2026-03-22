import { Module } from '@nestjs/common';
import { RegionBonusService } from './region-bonus.service';
import { RegionBonusController } from './region-bonus.controller';
import { WarEraApiModule } from '../warera-api/warera-api.module';
import { CompanyModule } from '../company/company.module';
import { ProductionCalculatorModule } from '../production-calculator/production-calculator.module';
import { GameConfigModule } from '../game-config/game-config.module';

@Module({
  imports: [WarEraApiModule, CompanyModule, ProductionCalculatorModule, GameConfigModule],
  controllers: [RegionBonusController],
  providers: [RegionBonusService],
  exports: [RegionBonusService],
})
export class RegionBonusModule {}
