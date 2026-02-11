import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { WarEraApiModule } from '../warera-api/warera-api.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [WarEraApiModule],
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService],
  exports: [CompanyService],
})
export class CompanyModule {}
