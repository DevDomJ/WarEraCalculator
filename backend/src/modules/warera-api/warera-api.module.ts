import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import * as https from 'https';
import { WarEraApiService } from './warera-api.service';

@Module({
  imports: [
    HttpModule.register({
      httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 10 }),
    }),
  ],
  providers: [WarEraApiService],
  exports: [WarEraApiService],
})
export class WarEraApiModule {}
