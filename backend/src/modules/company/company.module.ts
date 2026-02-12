import { Module, forwardRef } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { WarEraApiModule } from '../warera-api/warera-api.module';
import { ProductionBonusModule } from '../production-bonus/production-bonus.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [WarEraApiModule, forwardRef(() => ProductionBonusModule)],
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService],
  exports: [CompanyService],
})
export class CompanyModule {}
