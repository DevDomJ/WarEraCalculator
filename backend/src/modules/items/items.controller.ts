import { Controller, Get, Param } from '@nestjs/common';
import { GameConfigService } from '../game-config/game-config.service';
import { PrismaService } from '../../prisma.service';
import { getItemCategory } from '../../config/item-categories';
import { getItemDisplayName } from '../../config/item-display-names';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly gameConfig: GameConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getAllItems() {
    const items = await this.gameConfig.getItems();
    const itemsWithPrices = await Promise.all(
      items.map(async (item) => {
        const latestPrice = await this.prisma.priceHistory.findFirst({
          where: { itemCode: item.code },
          orderBy: { timestamp: 'desc' },
        });
        return { 
          ...item, 
          currentPrice: latestPrice?.price || null,
          category: getItemCategory(item.code),
          displayName: getItemDisplayName(item.code),
        };
      })
    );
    return itemsWithPrices;
  }

  @Get(':code')
  async getItem(@Param('code') code: string) {
    const item = await this.gameConfig.getItemByCode(code);
    if (!item) return null;
    
    const latestPrice = await this.prisma.priceHistory.findFirst({
      where: { itemCode: code },
      orderBy: { timestamp: 'desc' },
    });
    
    return { 
      ...item, 
      currentPrice: latestPrice?.price || null,
      category: getItemCategory(code),
      displayName: getItemDisplayName(code),
    };
  }
}
