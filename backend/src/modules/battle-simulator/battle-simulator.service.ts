import { Injectable, Logger } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';
import { extractData, TrpcResponse } from '../warera-api/warera-api.types';
import { PrismaService } from '../../prisma.service';
import {
  UserByIdData, CurrentEquipmentData, FullGameConfig,
  BuildInput, SimulationRequest, SimulationResult, EffectiveStats,
  HitLogEntry, SimulationEvent, DamageStats, CostStats, RevenueStats, NetProfitStats,
  GameItemConfig,
} from './battle-simulator.types';
import { SCRAP_PER_RARITY } from '../../config/scrap';

@Injectable()
export class BattleSimulatorService {
  private readonly logger = new Logger(BattleSimulatorService.name);
  private gameConfigCache: FullGameConfig | null = null;
  private gameConfigFetchedAt: number = 0;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000;

  constructor(
    private readonly warEraApi: WarEraApiService,
    private readonly prisma: PrismaService,
  ) {}

  async getGameConfig(): Promise<FullGameConfig> {
    if (this.gameConfigCache && Date.now() - this.gameConfigFetchedAt < this.CACHE_TTL) {
      return this.gameConfigCache;
    }
    try {
      const res = await this.warEraApi.request<TrpcResponse<FullGameConfig>>('gameConfig.getGameConfig');
      this.gameConfigCache = extractData(res);
      this.gameConfigFetchedAt = Date.now();
    } catch (e) {
      if (this.gameConfigCache) {
        this.logger.warn('Failed to refresh gameConfig, serving stale cache');
        return this.gameConfigCache;
      }
      throw e;
    }
    return this.gameConfigCache;
  }

  async getGameConfigForClient() {
    const config = await this.getGameConfig();
    return {
      skills: config.skills,
      battle: config.battle,
      loot: config.loot,
      items: this.getRelevantItems(config),
      hqLevels: config.upgradesConfig.headquarters.levels,
      regenDividedBy: config.user.regenDividedBy,
      maxHunger: config.user.maxHunger,
      skillPointsPerLevel: config.user.skillPointsPerLevel ?? 4,
      maxLevel: config.user.maxLevel ?? 100,
    };
  }

  async getUserSkills(userId: string) {
    const [userRes, equipRes, gameConfig] = await Promise.all([
      this.warEraApi.request<TrpcResponse<UserByIdData>>('user.getUserById', { userId }),
      this.warEraApi.request<TrpcResponse<CurrentEquipmentData>>('inventory.fetchCurrentEquipment', { userId }),
      this.getGameConfigForClient(),
    ]);

    const user = extractData(userRes);
    const equipment = extractData(equipRes);

    return {
      userId: user._id,
      username: user.username,
      militaryRank: user.militaryRank,
      militaryRankPercent: user.skills.attack?.militaryRankPercent ?? 0,
      leveling: user.leveling,
      skills: user.skills,
      equipment,
      gameConfig,
    };
  }

  /** Extract only weapon/equipment/ammo/food/buff items with their stats */
  private getRelevantItems(config: FullGameConfig): Record<string, GameItemConfig> {
    const relevant: Record<string, GameItemConfig> = {};
    for (const [code, item] of Object.entries(config.items)) {
      if (item.type === 'weapon' || item.type === 'equipment' ||
          item.usage === 'ammo' || item.isConsumable ||
          code === 'cocain' || code === 'scraps' ||
          code === 'case1' || code === 'case2') {
        relevant[code] = item;
      }
    }
    return relevant;
  }

  async simulate(req: SimulationRequest): Promise<SimulationResult> {
    const config = await this.getGameConfig();
    const prices = await this.getMarketPrices();
    return this.runSimulation(req, config, prices);
  }

  async compareBuilds(builds: { name: string; build: BuildInput }[], baseReq: Omit<SimulationRequest, 'build'>) {
    const config = await this.getGameConfig();
    const prices = await this.getMarketPrices();
    return builds.map(({ name, build }) => ({
      name,
      result: this.runSimulation({ ...baseReq, build }, config, prices),
    }));
  }

  private async getMarketPrices(): Promise<Record<string, number>> {
    const rows = await this.prisma.priceHistory.findMany({
      where: { itemCode: { in: ['lightAmmo', 'ammo', 'heavyAmmo', 'bread', 'steak', 'cookedFish', 'cocain', 'case1', 'case2', 'scraps'] } },
      orderBy: { timestamp: 'desc' },
      distinct: ['itemCode'],
    });
    const prices: Record<string, number> = {};
    for (const row of rows) {
      prices[row.itemCode] = row.price;
    }
    return prices;
  }

  // ─── Simulation Engine ───────────────────────────────────────────

  private runSimulation(req: SimulationRequest, config: FullGameConfig, prices: Record<string, number>): SimulationResult {
    const { build, militaryRankPercent, duration, bountyPer1kDmg, battleBonusPercent } = req;
    const seed = req.seed ?? Math.floor(Math.random() * 2147483647);
    const rng = this.createRng(seed);

    // Compute effective stats from build
    const stats = this.computeStats(build, config, militaryRankPercent);

    // Ammo percent
    const ammoItem = build.consumables.ammo !== 'none' ? config.items[build.consumables.ammo] : null;
    const ammoPercent = ammoItem?.flatStats?.percentAttack ?? 0;

    // Pill
    const pillActive = build.consumables.pill;

    // Food heal percent
    const foodItem = config.items[build.consumables.food];
    const foodHealPercent = foodItem?.flatStats?.healthRegenPercent ?? 10;

    // Attack total (multiplicative)
    const baseAttack = stats.attackValue + stats.weaponAttack;
    const attackTotal = baseAttack * (1 + militaryRankPercent / 100) * (1 + ammoPercent / 100);
    // Buff multiplier applied per-hit depending on time

    // Battle bonus multiplier
    const battleMult = 1 + battleBonusPercent / 100;

    // Duration setup
    const regenDiv = config.user.regenDividedBy; // 10 → 10% per hour
    const maxHealth = stats.health;
    const maxHunger = stats.hunger;
    const healthCost = config.battle.healthCost;
    const armorReduction = stats.armor / (stats.armor + (config.skills.armor.softCap ?? 40));
    const dodgeChance = stats.dodge / (stats.dodge + (config.skills.dodge.softCap ?? 40));
    const hpPerHit = healthCost * (1 - armorReduction);

    let totalHours = 0;
    if (duration === 'burst') totalHours = 0;
    else if (duration === '8h') totalHours = 8;
    else totalHours = 24;

    // Regen
    const healthRegen = totalHours * (maxHealth / regenDiv);
    const hungerRegen = totalHours * (maxHunger / regenDiv);

    // Starting resources
    let hp = maxHealth + healthRegen;
    let foodCharges = maxHunger + hungerRegen;
    const startingHp = hp;

    // Log
    const log: SimulationEvent[] = [];
    log.push({ type: 'header', message: `Starting ${duration === 'burst' ? 'Burst' : duration} Simulation...` });
    if (pillActive) {
      log.push({ type: 'pill', message: 'Using 1 Pill, gaining +60% damage.' });
    }
    log.push({ type: 'health', message: `Base Health: ${maxHealth} HP` });
    if (totalHours > 0) {
      log.push({ type: 'regen', message: `Regenerated ${healthRegen.toFixed(0)} HP over ${duration} +${healthRegen.toFixed(1)} HP` });
      log.push({ type: 'food_regen', message: `Gained ${hungerRegen.toFixed(0)} food charges from ${duration} regeneration (10% of ${maxHunger}/hr).` });
    }
    log.push({ type: 'total_hp', message: `Total starting health for simulation: ${startingHp.toFixed(0)} HP` });

    // Tracking
    let totalDamage = 0;
    let expectedDamage = 0;
    let hitCount = 0;
    let crits = 0;
    let misses = 0;
    let dodges = 0;
    let case1Drops = 0;
    let case2Drops = 0;
    let totalScraps = 0;
    let ammoUsed = 0;
    let foodUsed = 0;
    let weaponHits = 0;
    let armorHits = 0; // hits where armor took durability (no dodge)
    const equipmentDestroyed: { slot: string; rarity: string; scraps: number }[] = [];

    // Durability tracking (100 = full)
    let weaponDurability = 100;
    const armorDurability: Record<string, number> = {};
    const armorSlots = ['helmet', 'chest', 'pants', 'boots', 'gloves'] as const;
    for (const slot of armorSlots) {
      if (build.equipment[slot]?.code) {
        armorDurability[slot] = 100;
      }
    }

    const getRarityForSlot = (slot: string): string => {
      const code = slot === 'weapon' ? build.equipment.weapon?.code : build.equipment[slot]?.code;
      if (!code) return 'common';
      return config.items[code]?.rarity ?? 'common';
    };

    // Simulation loop
    const MAX_HITS = 10_000;
    while (hp > 0) {
      if (hitCount >= MAX_HITS) {
        log.push({ type: 'end', message: `Simulation capped at ${MAX_HITS} hits.` });
        break;
      }
      if (hp <= hpPerHit && foodCharges < 1) break; // can't survive next hit and no food

      hitCount++;
      ammoUsed += (build.consumables.ammo !== 'none') ? 1 : 0;

      // Buff multiplier — track simulated time for 24h pill transition
      // Each hit consumes HP; time is distributed proportionally over the duration
      // hitsPerHour ≈ totalHP / (hpPerHit × (1 - dodgeChance)) / totalHours
      let buffMult = 1;
      if (pillActive) {
        if (duration === '24h') {
          // Estimate elapsed hours based on HP consumed so far vs total HP pool
          const totalHpPool = startingHp + (maxHealth * (foodHealPercent / 100)) * (maxHunger + hungerRegen);
          const hpConsumed = startingHp - hp + foodUsed * maxHealth * (foodHealPercent / 100);
          const elapsedFraction = totalHpPool > 0 ? hpConsumed / totalHpPool : 0;
          const elapsedHours = elapsedFraction * totalHours;
          buffMult = elapsedHours < 8 ? 1.60 : 0.40;
        } else {
          buffMult = 1.60;
        }
      }

      const effectiveAttack = attackTotal * buffMult * battleMult;

      // Variance ±10%
      const variance = 0.9 + rng() * 0.2;
      const baseDamage = effectiveAttack * variance;

      // Precision check
      const isHit = rng() * 100 < stats.precision;
      const isMiss = !isHit;

      // Crit check (only on hit)
      const isCrit = isHit && rng() * 100 < stats.critChance;

      let damage: number;
      let critMult: number | undefined;
      if (isMiss) {
        damage = Math.round(baseDamage * 0.5);
        misses++;
      } else if (isCrit) {
        critMult = stats.critDamage / 100;
        damage = Math.round(baseDamage * critMult);
        crits++;
      } else {
        damage = Math.round(baseDamage);
      }

      totalDamage += damage;

      // Expected damage (statistical average per hit)
      const hitProb = Math.min(stats.precision, 100) / 100;
      const critProb = Math.min(stats.critChance, 100) / 100;
      const expectedHit = effectiveAttack * (
        (1 - hitProb) * 0.5 + // miss
        hitProb * (1 - critProb) * 1 + // normal hit
        hitProb * critProb * (stats.critDamage / 100) // crit
      );
      expectedDamage += expectedHit;

      // Dodge check
      const isDodged = rng() < dodgeChance;
      if (isDodged) dodges++;

      // HP loss
      let hpLost = 0;
      if (!isDodged) {
        hpLost = hpPerHit;
        hp -= hpLost;
        armorHits++;

        // Armor durability loss
        for (const slot of armorSlots) {
          if (armorDurability[slot] !== undefined) {
            armorDurability[slot] -= 1;
            if (armorDurability[slot] <= 0) {
              const rarity = getRarityForSlot(slot);
              const scraps = SCRAP_PER_RARITY[rarity] ?? 2;
              totalScraps += scraps;
              equipmentDestroyed.push({ slot, rarity, scraps });
              armorDurability[slot] = 100; // new piece
            }
          }
        }
      }

      // Weapon durability (always)
      weaponHits++;
      weaponDurability -= 1;
      if (weaponDurability <= 0) {
        const rarity = getRarityForSlot('weapon');
        const scraps = SCRAP_PER_RARITY[rarity] ?? 2;
        totalScraps += scraps;
        equipmentDestroyed.push({ slot: 'weapon', rarity, scraps });
        weaponDurability = 100;
      }

      // Loot (only on hit)
      let lootCase1 = false;
      let lootCase2 = false;
      if (isHit) {
        if (rng() * 100 < stats.lootChance) { lootCase1 = true; case1Drops++; }
        if (rng() * 100 < stats.lootChance / 100) { lootCase2 = true; case2Drops++; }
      }

      // Build log entry
      const entry: HitLogEntry = {
        hitNumber: hitCount,
        type: isMiss ? 'miss' : isCrit ? 'crit' : 'hit',
        damage,
        critMultiplier: critMult,
        dodged: isDodged,
        hpLost: isDodged ? 0 : +hpLost.toFixed(1),
        hpRemaining: +Math.max(hp, 0).toFixed(1),
        totalDamage,
        lootCase1,
        lootCase2,
      };

      // Check if food was eaten this hit (eat after taking damage when HP is low)
      if (hp > 0 && hp <= hpPerHit && foodCharges >= 1) {
        const healAmount = maxHealth * (foodHealPercent / 100);
        hp += healAmount;
        foodCharges -= 1;
        foodUsed++;
        entry.foodEaten = build.consumables.food;
        entry.hpHealed = +healAmount.toFixed(1);
        entry.hpRemaining = +hp.toFixed(1);
      }

      log.push({ type: 'hit', message: '', data: entry });
    }

    log.push({ type: 'end', message: `Simulation ended after ${hitCount} hits. Total Damage: ${this.formatNumber(totalDamage)}` });

    // Costs (prices may be 0 if not available — prepared for future)
    const weaponsUsed = weaponHits / 100;
    const armorSetsUsed = armorHits / 100;
    const ammoCost = ammoUsed * (prices[build.consumables.ammo] ?? 0);
    const foodCost = foodUsed * (prices[build.consumables.food] ?? 0);
    const boosterCost = pillActive ? (prices['cocain'] ?? 0) : 0;
    // TODO: Equipment price lookup — needs market price data for equipment items (varies by rarity).
    // When implemented: weaponCost = weaponsUsed × weapon market price, armorCost = sum of armor pieces used × their prices.
    const weaponCost = 0;
    const armorCost = 0;
    const totalCost = weaponCost + armorCost + ammoCost + foodCost + boosterCost;

    // Collect warnings for missing price data
    const warnings: string[] = [];
    if (build.consumables.ammo !== 'none' && !prices[build.consumables.ammo]) warnings.push(`No market price for ${build.consumables.ammo}`);
    if (foodUsed > 0 && !prices[build.consumables.food]) warnings.push(`No market price for ${build.consumables.food}`);
    if (pillActive && !prices['cocain']) warnings.push('No market price for Pill');
    if (!prices['case1']) warnings.push('No market price for Case');
    if (!prices['scraps']) warnings.push('No market price for Scraps');

    const costPer1kDmg = totalDamage > 0 ? (totalCost / totalDamage) * 1000 : 0;
    const theoreticalCostPer1kDmg = expectedDamage > 0 ? (totalCost / expectedDamage) * 1000 : 0;

    // Revenue
    const bounty = (totalDamage / 1000) * bountyPer1kDmg;
    const casesHitValue = case1Drops * (prices['case1'] ?? 0);
    // Pool loot: estimate based on damage
    const casesDmg = Math.floor(totalDamage / (config.loot.damagePerLootItem || 200000));
    const casesDmgValue = casesDmg * (prices['case1'] ?? 0);
    const scrapValue = totalScraps * (prices['scraps'] ?? 0);
    const totalRevenue = bounty + casesHitValue + casesDmgValue + scrapValue;

    // Steel/scrap consumed (for crafting context — count from destroyed equipment)
    const steelConsumed = 0; // Not tracked in this simulation
    const scrapConsumed = 0;

    const damageStats: DamageStats = {
      totalDamage,
      expectedDamage: Math.round(expectedDamage),
      avgPerHit: hitCount > 0 ? Math.round(totalDamage / hitCount) : 0,
      totalHits: hitCount,
      crits,
      critPercent: hitCount > 0 ? +(crits / hitCount * 100).toFixed(1) : 0,
      misses,
      missPercent: hitCount > 0 ? +(misses / hitCount * 100).toFixed(1) : 0,
      dodges,
      dodgePercent: hitCount > 0 ? +(dodges / hitCount * 100).toFixed(1) : 0,
    };

    const costStats: CostStats = {
      weaponCost, weaponsUsed: +weaponsUsed.toFixed(1),
      armorCost, armorSetsUsed: +armorSetsUsed.toFixed(1),
      ammoCost, ammoUsed,
      foodCost, foodUsed,
      boosterCost,
      steelConsumed, scrapConsumed,
      costPer1kDmg: +costPer1kDmg.toFixed(2),
      theoreticalCostPer1kDmg: +theoreticalCostPer1kDmg.toFixed(2),
      total: +totalCost.toFixed(3),
    };

    const revenueStats: RevenueStats = {
      bounty: +bounty.toFixed(3),
      casesHit: case1Drops,
      casesHitValue: +casesHitValue.toFixed(3),
      casesDmg,
      casesDmgValue: +casesDmgValue.toFixed(3),
      scrapCount: totalScraps,
      scrapValue: +scrapValue.toFixed(3),
      total: +totalRevenue.toFixed(3),
    };

    const netProfit = totalRevenue - totalCost;
    const netProfitStats: NetProfitStats = {
      netProfit: +netProfit.toFixed(3),
      profitPer1k: totalDamage > 0 ? +((netProfit / totalDamage) * 1000).toFixed(2) : 0,
      roi: totalCost > 0 ? +((netProfit / totalCost) * 100).toFixed(0) : 0,
      revenue: +totalRevenue.toFixed(3),
      costs: +totalCost.toFixed(3),
      hitRate: hitCount > 0 ? +((hitCount - misses) / hitCount * 100).toFixed(0) : 0,
      dodgeRate: hitCount > 0 ? +(dodges / hitCount * 100).toFixed(0) : 0,
    };

    return { effectiveStats: stats.effectiveStats, damage: damageStats, costs: costStats, revenue: revenueStats, netProfit: netProfitStats, log, warnings };
  }

  // ─── Stat Computation ────────────────────────────────────────────

  private computeStats(build: BuildInput, config: FullGameConfig, militaryRankPercent: number) {
    const skillCfg = config.skills;

    const getSkillValue = (name: string): number => {
      const level = Math.max(0, Math.min(build.skills[name] ?? 0, 10));
      return skillCfg[name]?.levels[String(level)]?.value ?? 0;
    };

    const getEquipStat = (stat: string): number => {
      let total = 0;
      for (const slot of ['weapon', 'helmet', 'chest', 'pants', 'boots', 'gloves'] as const) {
        const eq = build.equipment[slot];
        if (eq?.stats?.[stat]) {
          // Clamp individual stat values to reasonable maximums (mythic ranges)
          const val = Math.max(0, Math.min(eq.stats[stat], 300));
          total += val;
        }
      }
      return total;
    };

    // Base skill values
    const attackBase = getSkillValue('attack');
    const attackEquip = getEquipStat('attack');
    const precisionBase = getSkillValue('precision');
    const precisionEquip = getEquipStat('precision');
    const critChanceBase = getSkillValue('criticalChance');
    const critChanceEquip = getEquipStat('criticalChance');
    const critDamageBase = getSkillValue('criticalDamages');
    const critDamageEquip = getEquipStat('criticalDamages');
    const armorBase = getSkillValue('armor');
    const armorEquip = getEquipStat('armor');
    const dodgeBase = getSkillValue('dodge');
    const dodgeEquip = getEquipStat('dodge');

    // Overflow: precision > 100 → +4 attack per point
    const precisionTotal = precisionBase + precisionEquip;
    const precisionOverflow = Math.max(0, precisionTotal - 100);
    const precision = Math.min(precisionTotal, 100);
    const overflowAttack = precisionOverflow * (skillCfg.precision?.skillOverflowValue ?? 4);

    // Overflow: critChance > 100 → +4 critDamage per point
    const critChanceTotal = critChanceBase + critChanceEquip;
    const critChanceOverflow = Math.max(0, critChanceTotal - 100);
    const critChance = Math.min(critChanceTotal, 100);
    const overflowCritDmg = critChanceOverflow * (skillCfg.criticalChance?.skillOverflowValue ?? 4);

    const armor = armorBase + armorEquip;
    const dodge = dodgeBase + dodgeEquip;
    const critDamage = critDamageBase + critDamageEquip + overflowCritDmg;

    const effectiveStats: EffectiveStats = {
      attack: { base: attackBase, equipment: attackEquip, overflow: overflowAttack, total: attackBase + attackEquip + overflowAttack },
      precision: { base: precisionBase, equipment: precisionEquip, total: precision },
      critChance: { base: critChanceBase, equipment: critChanceEquip, total: critChance },
      critDamage: { base: critDamageBase, equipment: critDamageEquip, overflow: overflowCritDmg, total: critDamage },
      armor: { base: armorBase, equipment: armorEquip, total: armor },
      dodge: { base: dodgeBase, equipment: dodgeEquip, total: dodge },
      health: getSkillValue('health'),
      hunger: getSkillValue('hunger'),
      lootChance: getSkillValue('lootChance'),
    };

    return {
      effectiveStats,
      attackValue: attackBase + overflowAttack,
      weaponAttack: attackEquip,
      precision,
      critChance,
      critDamage,
      armor,
      dodge,
      health: effectiveStats.health,
      hunger: effectiveStats.hunger,
      lootChance: effectiveStats.lootChance,
    };
  }

  // ─── Seeded RNG (mulberry32) ─────────────────────────────────────

  private createRng(seed: number): () => number {
    let s = seed | 0;
    return () => {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private formatNumber(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
    return n.toString();
  }
}
