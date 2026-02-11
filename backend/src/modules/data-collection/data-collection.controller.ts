import { Controller, Post } from '@nestjs/common';
import { DataCollectionService } from './data-collection.service';

@Controller('data-collection')
export class DataCollectionController {
  constructor(private readonly service: DataCollectionService) {}

  @Post('trigger')
  async trigger() {
    await this.service.runCollection();
    return { message: 'Data collection triggered successfully' };
  }
}
