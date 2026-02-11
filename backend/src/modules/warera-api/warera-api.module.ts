import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WarEraApiService } from './warera-api.service';

@Module({
  imports: [HttpModule],
  providers: [WarEraApiService],
  exports: [WarEraApiService],
})
export class WarEraApiModule {}
