import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';
import { PrismaService } from '../../prisma.service';

interface GameItem {
  code: string;
  name: string;
  icon?: string;
  order: number;
  productionPoints?: number;
  productionNeeds?: Record<string, number>;
}

@Injectable()
export class GameConfigService implements OnModuleInit {
  private readonly logger = new Logger(GameConfigService.name);
  private itemsCache: GameItem[] = [];
  private lastFetch: Date | null = null;
  private readonly cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    private readonly apiService: WarEraApiService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.fetchAndCacheGameConfig();
  }

  async fetchAndCacheGameConfig(): Promise<void> {
    if (this.lastFetch && Date.now() - this.lastFetch.getTime() < this.cacheTTL) {
      this.logger.log('Using cached game config');
      return;
    }

    try {
      this.logger.log('Fetching game configuration...');
      const config = await this.apiService.request<any>('gameConfig.getGameConfig');
      
      if (config?.result?.data?.items) {
        const items = config.result.data.items;
        
        // Handle both object and array formats
        const itemsArray = Array.isArray(items) 
          ? items 
          : Object.values(items);
        
        this.itemsCache = itemsArray.map((item: any, index: number) => ({
          code: item.code || item.id,
          name: item.name || item.displayName || item.code || item.id,
          icon: item.icon || item.iconUrl || null,
          order: index,
        }));

        await this.saveItemsToDatabase(this.itemsCache);
        this.lastFetch = new Date();
        this.logger.log(`Cached ${this.itemsCache.length} items`);
      }
    } catch (error) {
      this.logger.error('Failed to fetch game config', error);
    }
  }

  private async saveItemsToDatabase(items: GameItem[]): Promise<void> {
    for (const item of items) {
      await this.prisma.item.upsert({
        where: { code: item.code },
        update: { name: item.name, icon: item.icon, order: item.order },
        create: item,
      });
    }
  }

  async getItems(): Promise<GameItem[]> {
    if (this.itemsCache.length === 0) {
      const items = await this.prisma.item.findMany({ orderBy: { order: 'asc' } });
      this.itemsCache = items;
    }
    return this.itemsCache;
  }

  async getItemByCode(code: string): Promise<GameItem | null> {
    return this.prisma.item.findUnique({ where: { code } });
  }
}
