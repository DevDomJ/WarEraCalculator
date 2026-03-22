import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WarEraApiService } from '../warera-api/warera-api.service';
import {
  extractData,
  RegionAllResponse,
  CountryAllResponse,
  RegionAllData,
  CountryAllData,
  PartyData,
  PartyByIdResponse,
} from '../warera-api/warera-api.types';
import { CompanyService, AutomationProfitMetrics, ProductionBonusBreakdown } from '../company/company.service';
import { ProductionCalculatorService } from '../production-calculator/production-calculator.service';
import { GameConfigService } from '../game-config/game-config.service';
import { getItemCategory, ITEM_CATEGORIES } from '../../config/item-categories';

export interface RegionBonusEntry {
  regionId: string;
  regionName: string;
  countryCode: string;
  countryName: string;
  bonus: ProductionBonusBreakdown;
  deposit?: {
    type: string;
    endsAt: string;
    bonusPercent: number;
  };
}

export interface ItemRecommendation {
  bestRegion: {
    regionId: string;
    regionName: string;
    countryCode: string;
    countryName: string;
  };
  bonus: ProductionBonusBreakdown;
  depositExpiresAt?: string;
  profitMetrics: AutomationProfitMetrics & { profitPerPP: number };
  engineLevel: number;
}

export interface ItemRecommendationDetail extends ItemRecommendation {
  topRegions: Array<{
    regionId: string;
    regionName: string;
    countryCode: string;
    countryName: string;
    bonus: ProductionBonusBreakdown;
    depositExpiresAt?: string;
    profitMetrics: AutomationProfitMetrics & { profitPerPP: number };
  }>;
}

// Items affected by agrarianism ethics
const AGRARIANISM_ITEMS = ['coca', 'grain', 'livestock', 'fish'];

// Items affected by industrialism ethics
const INDUSTRIALISM_ITEMS = [
  ...ITEM_CATEGORIES.Ammo,
  ...ITEM_CATEGORIES.Construction,
];

@Injectable()
export class RegionBonusService implements OnModuleInit {
  private readonly logger = new Logger(RegionBonusService.name);

  // In-memory cache: itemCode → sorted RegionBonusEntry[]
  private bonusMap = new Map<string, RegionBonusEntry[]>();
  private lastRefresh: Date | null = null;

  // Raw cached data for building the map
  private regions: RegionAllData[] = [];
  private countries: CountryAllData[] = [];
  private parties = new Map<string, PartyData>();

  constructor(
    private readonly apiService: WarEraApiService,
    private readonly companyService: CompanyService,
    private readonly productionCalculatorService: ProductionCalculatorService,
    private readonly gameConfigService: GameConfigService,
  ) {}

  async onModuleInit() {
    await this.refreshData();
  }

  @Cron('0 * * * *') // every hour at minute 0
  async handleCron() {
    await this.refreshData();
  }

  async refreshData(): Promise<void> {
    try {
      this.logger.log('Refreshing region bonus data...');

      // Fetch regions and countries in parallel
      const [regionsRes, countriesRes] = await Promise.all([
        this.apiService.request<RegionAllResponse>('region.getAll'),
        this.apiService.request<CountryAllResponse>('country.getAllCountries'),
      ]);

      this.regions = extractData(regionsRes) || [];
      this.countries = extractData(countriesRes) || [];

      this.logger.log(`Fetched ${this.regions.length} regions, ${this.countries.length} countries`);

      // Batch-fetch all ruling parties
      const partyIds = this.countries
        .map(c => c.rulingParty)
        .filter((id): id is string => !!id);

      this.parties.clear();
      const batchSize = 100;
      for (let i = 0; i < partyIds.length; i += batchSize) {
        const batch = partyIds.slice(i, i + batchSize);
        const results = await this.apiService.batchRequest<PartyByIdResponse>(
          batch.map(partyId => ({ endpoint: 'party.getById', params: { partyId } })),
        );
        results.forEach(r => {
          const party = r?.result?.data;
          if (party?._id) this.parties.set(party._id, party);
        });
      }

      this.logger.log(`Fetched ${this.parties.size} parties`);

      // Build bonus map for all producible non-equipment items
      await this.buildBonusMap();
      this.lastRefresh = new Date();

      this.logger.log(`Region bonus cache built for ${this.bonusMap.size} items`);
    } catch (error) {
      this.logger.error('Failed to refresh region bonus data', error);
    }
  }

  private async buildBonusMap(): Promise<void> {
    const items = await this.gameConfigService.getItems();
    const newMap = new Map<string, RegionBonusEntry[]>();

    // Build country lookup by _id
    const countryById = new Map<string, CountryAllData>();
    for (const c of this.countries) countryById.set(c._id, c);

    // For each producible non-equipment item, calculate bonus per region
    for (const item of items) {
      if (getItemCategory(item.code) === 'Equipment') continue;

      const entries: RegionBonusEntry[] = [];

      for (const region of this.regions) {
        const country = countryById.get(region.country);
        if (!country) continue;

        const bonus = this.calculateBonus(item.code, region, country);
        if (bonus.total === 0) continue;

        entries.push({
          regionId: region._id,
          regionName: region.name,
          countryCode: country.code,
          countryName: country.name,
          bonus,
          deposit: this.isDepositActive(region, item.code)
            ? { type: region.deposit!.type, endsAt: region.deposit!.endsAt, bonusPercent: region.deposit!.bonusPercent }
            : undefined,
        });
      }

      // Sort by total bonus descending
      entries.sort((a, b) => b.bonus.total - a.bonus.total);
      newMap.set(item.code, entries);
    }

    this.bonusMap = newMap;
  }

  private calculateBonus(
    itemCode: string,
    region: RegionAllData,
    country: CountryAllData,
  ): RegionBonusEntry['bonus'] {
    // Ethics from ruling party
    const party = country.rulingParty ? this.parties.get(country.rulingParty) : undefined;
    const industrialism = party?.ethics?.industrialism || 0;

    // Agrarianism 2 negates country specialization
    const effectiveSpecialization = industrialism === -2 ? undefined : country.specializedItem;

    // Strategic bonus: only applies to the specialized item, calculated per resource
    const strategicBonus = (effectiveSpecialization === itemCode)
      ? this.calculateStrategicBonus(country)
      : 0;

    const depositActive = this.isDepositActive(region, itemCode);
    const depositBonus = depositActive ? region.deposit!.bonusPercent : 0;

    const ethicSpecializationBonus = this.calculateEthicBonus(
      effectiveSpecialization, itemCode, industrialism,
    );

    const ethicDepositBonus = (depositActive && effectiveSpecialization !== itemCode)
      ? this.calculateEthicBonus(region.deposit!.type, itemCode, industrialism)
      : 0;

    return {
      total: strategicBonus + depositBonus + ethicSpecializationBonus + ethicDepositBonus,
      strategicBonus,
      depositBonus,
      ethicSpecializationBonus,
      ethicDepositBonus,
    };
  }

  /** Calculate strategic resource bonus: 5% for 1st of each type, 0.5% for 2nd, 0.25% for 3rd+ */
  private calculateStrategicBonus(country: CountryAllData): number {
    const resources = country.strategicResources?.resources;
    if (!resources) return 0;

    let total = 0;
    for (const regionIds of Object.values(resources)) {
      const count = regionIds.length;
      if (count >= 1) total += 5;
      if (count >= 2) total += 0.5;
      for (let i = 2; i < count; i++) total += 0.25;
    }
    return total;
  }

  private calculateEthicBonus(
    targetItem: string | undefined,
    producedItem: string,
    industrialism: number,
  ): number {
    if (!targetItem || targetItem !== producedItem) return 0;

    if (industrialism > 0 && INDUSTRIALISM_ITEMS.includes(producedItem)) {
      return industrialism === 1 ? 10 : 30;
    }
    if (industrialism < 0 && AGRARIANISM_ITEMS.includes(producedItem)) {
      return Math.abs(industrialism) === 1 ? 10 : 30;
    }
    return 0;
  }

  private isDepositActive(region: RegionAllData, itemCode: string): boolean {
    if (!region.deposit || region.deposit.type !== itemCode) return false;
    return new Date(region.deposit.endsAt) > new Date();
  }

  /** Get best region entries for an item (sorted by bonus desc) */
  getRegionBonuses(itemCode: string): RegionBonusEntry[] {
    return this.bonusMap.get(itemCode) || [];
  }

  /** Get recommendations for all producible non-equipment items */
  async getAllRecommendations(engineLevel = 4): Promise<Record<string, ItemRecommendation>> {
    const result: Record<string, ItemRecommendation> = {};

    for (const [itemCode, entries] of this.bonusMap) {
      if (entries.length === 0) continue;
      const best = entries[0];
      const metrics = await this.calculateProfitForEntry(itemCode, best, engineLevel);
      if (!metrics) continue;

      result[itemCode] = {
        bestRegion: {
          regionId: best.regionId,
          regionName: best.regionName,
          countryCode: best.countryCode,
          countryName: best.countryName,
        },
        bonus: best.bonus,
        depositExpiresAt: best.deposit?.endsAt,
        profitMetrics: metrics,
        engineLevel,
      };
    }

    // Also include items with 0 bonus (no entry in bonusMap but still producible)
    const items = await this.gameConfigService.getItems();
    for (const item of items) {
      if (result[item.code] || getItemCategory(item.code) === 'Equipment') continue;

      const metrics = await this.calculateProfitForBonus(item.code, 0, engineLevel);
      if (!metrics) continue;

      result[item.code] = {
        bestRegion: { regionId: '', regionName: 'Any', countryCode: '', countryName: '' },
        bonus: { total: 0, strategicBonus: 0, depositBonus: 0, ethicSpecializationBonus: 0, ethicDepositBonus: 0 },
        profitMetrics: metrics,
        engineLevel,
      };
    }

    return result;
  }

  /** Get detailed recommendation for a single item */
  async getItemRecommendation(itemCode: string, engineLevel = 4): Promise<ItemRecommendationDetail | null> {
    const entries = this.getRegionBonuses(itemCode);
    const top = entries.slice(0, 5);

    // Calculate profit for top regions
    const topRegions = (await Promise.all(
      top.map(async entry => {
        const metrics = await this.calculateProfitForEntry(itemCode, entry, engineLevel);
        if (!metrics) return null;
        return {
          regionId: entry.regionId,
          regionName: entry.regionName,
          countryCode: entry.countryCode,
          countryName: entry.countryName,
          bonus: entry.bonus,
          depositExpiresAt: entry.deposit?.endsAt,
          profitMetrics: metrics,
        };
      }),
    )).filter((r): r is NonNullable<typeof r> => r !== null);

    // Best region (or fallback to 0-bonus)
    const best = topRegions[0];
    const fallbackMetrics = !best ? await this.calculateProfitForBonus(itemCode, 0, engineLevel) : null;
    if (!best && !fallbackMetrics) return null;

    return {
      bestRegion: best
        ? { regionId: best.regionId, regionName: best.regionName, countryCode: best.countryCode, countryName: best.countryName }
        : { regionId: '', regionName: 'Any', countryCode: '', countryName: '' },
      bonus: best?.bonus || { total: 0, strategicBonus: 0, depositBonus: 0, ethicSpecializationBonus: 0, ethicDepositBonus: 0 },
      depositExpiresAt: best?.depositExpiresAt,
      profitMetrics: best?.profitMetrics || fallbackMetrics!,
      engineLevel,
      topRegions,
    };
  }

  private async calculateProfitForEntry(
    itemCode: string,
    entry: RegionBonusEntry,
    engineLevel: number,
  ): Promise<(AutomationProfitMetrics & { profitPerPP: number }) | null> {
    return this.calculateProfitForBonus(itemCode, entry.bonus.total, engineLevel);
  }

  private async calculateProfitForBonus(
    itemCode: string,
    bonusPercent: number,
    engineLevel: number,
  ): Promise<(AutomationProfitMetrics & { profitPerPP: number }) | null> {
    const recipe = await this.productionCalculatorService.getRecipeByItemCode(itemCode);
    const item = await this.gameConfigService.getItemByCode(itemCode);
    const productionPoints = recipe?.productionPoints || item?.productionPoints;
    if (!productionPoints) return null;

    const bonusMultiplier = bonusPercent / 100;
    const metrics = await this.companyService.calculateAutomationProfitMetrics(
      engineLevel, itemCode, productionPoints, bonusMultiplier,
    );

    const dailyPP = engineLevel * 24 * (1 + bonusMultiplier);
    const profitPerPP = dailyPP > 0 ? metrics.profit / dailyPP : 0;

    return { ...metrics, profitPerPP };
  }

  isReady(): boolean {
    return this.lastRefresh !== null;
  }
}
