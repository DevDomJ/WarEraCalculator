import { Controller, Get, Param } from '@nestjs/common';
import { GameConfigService } from '../game-config/game-config.service';
import { PrismaService } from '../../prisma.service';
import { getItemCategory } from '../../config/item-categories';
import { getItemDisplayName } from '../../config/item-display-names';
import { SCRAP_PER_RARITY, RARITIES, DISMANTLE_MULTIPLIER } from '../../config/scrap';

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

  @Get('dismantle-values')
  async getDismantleValues() {
    // Get latest scrap sell and buy orders
    const [lowestSell, highestBuy] = await Promise.all([
      this.prisma.tradingOrder.findFirst({
        where: { itemCode: 'scraps', type: 'sell' },
        orderBy: { price: 'asc' },
      }),
      this.prisma.tradingOrder.findFirst({
        where: { itemCode: 'scraps', type: 'buy' },
        orderBy: { price: 'desc' },
      }),
    ]);

    return {
      scrapSellPrice: lowestSell?.price ?? null,
      scrapBuyPrice: highestBuy?.price ?? null,
      tiers: RARITIES.map(rarity => {
        const scrapCount = SCRAP_PER_RARITY[rarity] * DISMANTLE_MULTIPLIER;
        return {
          rarity,
          scrapCount,
          sellValue: lowestSell ? scrapCount * lowestSell.price : null,
          buyValue: highestBuy ? scrapCount * highestBuy.price : null,
        };
      }),
    };
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
