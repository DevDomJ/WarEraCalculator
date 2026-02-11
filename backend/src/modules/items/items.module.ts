import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { GameConfigModule } from '../game-config/game-config.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [GameConfigModule],
  controllers: [ItemsController],
  providers: [PrismaService],
})
export class ItemsModule {}
