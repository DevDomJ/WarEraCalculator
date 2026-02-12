import { Module } from '@nestjs/common';
import { ProductionBonusService } from './production-bonus.service';
import { WarEraApiModule } from '../warera-api/warera-api.module';
import { EthicsModule } from '../ethics/ethics.module';

@Module({
  imports: [WarEraApiModule, EthicsModule],
  providers: [ProductionBonusService],
  exports: [ProductionBonusService],
})
export class ProductionBonusModule {}
