import { Module } from '@nestjs/common';
import { MuService } from './mu.service';
import { MuController } from './mu.controller';
import { WarEraApiModule } from '../warera-api/warera-api.module';

@Module({
  imports: [WarEraApiModule],
  controllers: [MuController],
  providers: [MuService],
  exports: [MuService],
})
export class MuModule {}
