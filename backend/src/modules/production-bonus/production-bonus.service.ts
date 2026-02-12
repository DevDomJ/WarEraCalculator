import { Injectable, Logger } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';
import { EthicsService } from '../ethics/ethics.service';
import { ProductionBonusBreakdown } from '../company/company.service';
import { getItemCategory } from '../../config/item-categories';

interface CountryCache {
  data: any;
  fetchedAt: Date;
}

interface PartyCache {
  data: any;
  fetchedAt: Date;
}

@Injectable()
export class ProductionBonusService {
  private readonly logger = new Logger(ProductionBonusService.name);
  private countryCache = new Map<string, CountryCache>();
  private partyCache = new Map<string, PartyCache>();

  constructor(
    private readonly apiService: WarEraApiService,
    private readonly ethicsService: EthicsService,
  ) {}

  clearCache(countryId?: string, partyId?: string) {
    if (countryId) {
      this.countryCache.delete(countryId);
    } else if (partyId) {
      this.partyCache.delete(partyId);
    } else {
      this.countryCache.clear();
      this.partyCache.clear();
    }
  }

  async calculateProductionBonus(
    regionId: string,
    itemCode: string,
    forceRefresh = false,
  ): Promise<ProductionBonusBreakdown> {
    const breakdown: ProductionBonusBreakdown = { total: 0 };

    try {
      // Get region to find country
      const regionResponse: any = await this.apiService.request('region.getById', { regionId });
      const region = Array.isArray(regionResponse) ? regionResponse[0]?.result?.data : regionResponse?.result?.data;
      
      if (!region?.country) {
        return breakdown;
      }

      // Get country data (cached until hour changes)
      const country = await this.getCountryWithCache(region.country, forceRefresh);

      if (!country) {
        return breakdown;
      }

      // Check if item matches country specialization
      if (country.specializedItem === itemCode) {
        const countryBonus = country.strategicResources?.bonuses?.productionPercent || 0;
        breakdown.country = {
          bonus: countryBonus,
          countryName: country.name,
          countryCode: country.code,
          specializedItem: country.specializedItem,
        };
        breakdown.total += countryBonus;
      }

      // Get ruling party ethics bonus (cached for 12 hours)
      if (country.rulingParty) {
        const party = await this.getPartyWithCache(country.rulingParty, forceRefresh);

        if (party?.ethics) {
          const itemCategory = getItemCategory(itemCode);
          
          if (itemCategory) {
            const partyBonus = this.ethicsService.getProductionBonus(
              party.ethics,
              itemCode,
              itemCategory,
            );

            if (partyBonus > 0) {
              let ethicName = 'Unknown';
              if (party.ethics.industrialism > 0 && ['Ammo', 'Construction'].includes(itemCategory)) {
                ethicName = 'Industrialism';
              } else if (party.ethics.agrarianism > 0) {
                ethicName = 'Agrarianism';
              }

              breakdown.party = {
                bonus: partyBonus,
                partyName: party.name,
                ethicName,
              };
              breakdown.total += partyBonus;
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to calculate production bonus: ${error.message}`);
    }

    return breakdown;
  }

  private async getCountryWithCache(countryId: string, forceRefresh = false): Promise<any> {
    const cached = this.countryCache.get(countryId);
    const now = new Date();

    // Check if cached and still in same hour
    if (!forceRefresh && cached && cached.fetchedAt.getHours() === now.getHours() && 
        cached.fetchedAt.getDate() === now.getDate()) {
      return cached.data;
    }

    // Fetch fresh data
    const countryResponse: any = await this.apiService.request('country.getCountryById', {
      countryId,
    });
    const country = Array.isArray(countryResponse) ? countryResponse[0]?.result?.data : countryResponse?.result?.data;

    if (country) {
      this.countryCache.set(countryId, { data: country, fetchedAt: now });
    }

    return country;
  }

  private async getPartyWithCache(partyId: string, forceRefresh = false): Promise<any> {
    const cached = this.partyCache.get(partyId);
    const now = new Date();

    // Check if cached and less than 12 hours old
    if (!forceRefresh && cached) {
      const hoursDiff = (now.getTime() - cached.fetchedAt.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < 12) {
        return cached.data;
      }
    }

    // Fetch fresh data
    const partyResponse: any = await this.apiService.request('party.getById', {
      partyId,
    });
    const party = Array.isArray(partyResponse) ? partyResponse[0]?.result?.data : partyResponse?.result?.data;

    if (party) {
      this.partyCache.set(partyId, { data: party, fetchedAt: now });
    }

    return party;
  }
}
