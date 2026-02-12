import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface EthicBonus {
  type: string;
  value: number;
  appliesTo?: {
    categories?: string[];
    items?: string[];
  };
}

export interface EthicLevel {
  level: number;
  bonuses: EthicBonus[];
}

export interface Ethic {
  name: string;
  description: string;
  levels: EthicLevel[];
}

export interface PartyEthics {
  militarism?: number;
  isolationism?: number;
  imperialism?: number;
  industrialism?: number;
  agrarianism?: number;
}

@Injectable()
export class EthicsService {
  private readonly logger = new Logger(EthicsService.name);
  private readonly ethics: Record<string, Ethic>;

  constructor() {
    const configPath = join(__dirname, '../../config/ethics.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    this.ethics = config.ethics;
  }

  /**
   * Calculate production bonus from party ethics for a specific item
   */
  getProductionBonus(partyEthics: PartyEthics, itemCode: string, itemCategory: string): number {
    let totalBonus = 0;

    for (const [ethicName, level] of Object.entries(partyEthics)) {
      if (!level || level === 0) continue;

      const ethic = this.ethics[ethicName];
      if (!ethic) continue;

      const ethicLevel = ethic.levels.find(l => l.level === level);
      if (!ethicLevel) continue;

      for (const bonus of ethicLevel.bonuses) {
        if (bonus.type !== 'production') continue;

        // Check if bonus applies to this item
        if (bonus.appliesTo?.categories?.includes(itemCategory)) {
          totalBonus += bonus.value;
          this.logger.debug(`Applied ${ethicName} level ${level}: +${bonus.value}% to ${itemCategory}`);
        } else if (bonus.appliesTo?.items?.includes(itemCode)) {
          totalBonus += bonus.value;
          this.logger.debug(`Applied ${ethicName} level ${level}: +${bonus.value}% to ${itemCode}`);
        }
      }
    }

    return totalBonus;
  }

  /**
   * Get all bonuses from party ethics
   */
  getAllBonuses(partyEthics: PartyEthics): EthicBonus[] {
    const bonuses: EthicBonus[] = [];

    for (const [ethicName, level] of Object.entries(partyEthics)) {
      if (!level || level === 0) continue;

      const ethic = this.ethics[ethicName];
      if (!ethic) continue;

      const ethicLevel = ethic.levels.find(l => l.level === level);
      if (ethicLevel) {
        bonuses.push(...ethicLevel.bonuses);
      }
    }

    return bonuses;
  }
}
