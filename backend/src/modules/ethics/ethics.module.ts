import { Module } from '@nestjs/common';
import { EthicsService } from './ethics.service';

@Module({
  providers: [EthicsService],
  exports: [EthicsService],
})
export class EthicsModule {}
