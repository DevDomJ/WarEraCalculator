import { Injectable, Logger } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';
import { EthicsService } from '../ethics/ethics.service';
import { ProductionBonusBreakdown } from '../company/company.service';
import { getItemCategory } from '../../config/item-categories';

@Injectable()
export class ProductionBonusService {
  private readonly logger = new Logger(ProductionBonusService.name);

  constructor(
    private readonly apiService: WarEraApiService,
    private readonly ethicsService: EthicsService,
  ) {}

  async calculateProductionBonus(
    regionId: string,
    itemCode: string,
  ): Promise<ProductionBonusBreakdown> {
    const breakdown: ProductionBonusBreakdown = { total: 0 };

    try {
      // Get region to find country
      const regionResponse: any = await this.apiService.request('region.getById', { regionId });
      const region = Array.isArray(regionResponse) ? regionResponse[0]?.result?.data : regionResponse?.result?.data;
      
      if (!region?.country) {
        return breakdown;
      }

      // Get country data
      const countryResponse: any = await this.apiService.request('country.getCountryById', {
        countryId: region.country,
      });
      const country = Array.isArray(countryResponse) ? countryResponse[0]?.result?.data : countryResponse?.result?.data;

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

      // Get ruling party ethics bonus
      if (country.rulingParty) {
        const partyResponse: any = await this.apiService.request('party.getById', {
          partyId: country.rulingParty,
        });
        const party = Array.isArray(partyResponse) ? partyResponse[0]?.result?.data : partyResponse?.result?.data;

        if (party?.ethics) {
          // Get item category
          const itemCategory = getItemCategory(itemCode);
          
          if (itemCategory) {
            const partyBonus = this.ethicsService.getProductionBonus(
              party.ethics,
              itemCode,
              itemCategory,
            );

            if (partyBonus > 0) {
              // Determine which ethic is providing the bonus
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
}
