// --- user.getUserById response types ---

export interface UserSkillData {
  level: number;
  currentBarValue?: number;
  value: number | null;
  weapon: number | null;
  equipment: number | null;
  limited: number | null;
  total: number;
  totalAfterSoftCap: number | null;
  hourlyBarRegen?: number;
  overflow: number | null;
  // attack-specific
  ammoPercent?: number;
  buffsPercent?: number;
  debuffsPercent?: number;
  militaryRankPercent?: number;
}

export interface UserSkills {
  energy: UserSkillData;
  health: UserSkillData;
  hunger: UserSkillData;
  attack: UserSkillData;
  companies: UserSkillData;
  entrepreneurship: UserSkillData;
  production: UserSkillData;
  criticalChance: UserSkillData;
  criticalDamages: UserSkillData;
  armor: UserSkillData;
  precision: UserSkillData;
  dodge: UserSkillData;
  lootChance: UserSkillData;
  management: UserSkillData;
}

export interface UserLeveling {
  level: number;
  totalXp: number;
  availableSkillPoints: number;
  spentSkillPoints: number;
  totalSkillPoints: number;
  freeReset: number;
}

export interface UserEquipmentSlots {
  weapon?: string;
  helmet?: string;
  chest?: string;
  pants?: string;
  boots?: string;
  gloves?: string;
  ammo?: string;
}

export interface UserByIdData {
  _id: string;
  username: string;
  militaryRank: number;
  leveling: UserLeveling;
  skills: UserSkills;
  equipment: UserEquipmentSlots;
}

// --- inventory.fetchCurrentEquipment response types ---

export interface EquipmentItemData {
  _id: string;
  code: string;
  type?: string;
  skills: Record<string, number>;
  state: number;
  maxState: number;
  quantity: number;
  lastAcquisitionAt: string;
}

export interface CurrentEquipmentData {
  weapon?: EquipmentItemData;
  helmet?: EquipmentItemData;
  chest?: EquipmentItemData;
  pants?: EquipmentItemData;
  boots?: EquipmentItemData;
  gloves?: EquipmentItemData;
  ammo?: string;
  ammoQuantity?: number;
}

// --- gameConfig skill/item types ---

export interface SkillLevelConfig {
  value: number;
  totalCost: number;
  cost?: number;
  isABar?: boolean;
  unlockAtLevel: number;
}

export interface SkillConfig {
  levels: Record<string, SkillLevelConfig>;
  skillOverflow?: string;
  skillOverflowValue?: number;
  softCap?: number;
}

export interface GameItemConfig {
  type: string;
  code: string;
  usage?: string;
  rarity: string;
  dynamicStats?: Record<string, [number, number]>;
  flatStats?: Record<string, number>;
  productionPoints?: number;
  isConsumable?: boolean;
  isTradable?: boolean;
}

export interface BattleConfig {
  healthCost: number;
  countryOrderBonusPercent: number;
  muOrderBonusPercent: number;
  allianceDamagesBonusPercent: number;
  enemyDamagesBonusPercent: number;
  patrioticBonusPercent: number;
  regionNotLinkedToCapitalMalusPercent: number;
  lostAttackingRegionMalusPercent: number;
  occupyingYourRegionsMalusPercent: number;
  govMemberBountyRewardPercent: number;
  hitFor1CaseInPool: number;
  casesPer1kDamagesInPool: number;
  rankingsLootPercentPer1kDmg: number;
}

export interface LootConfig {
  weaponChancePercent: number;
  damagePerLootItem: number;
  battleLootDamagePerLootItem: number;
}

export interface HQLevel {
  level: number;
  steelCost: number;
  maintenanceCost: number;
  stats: { attackBonus: number };
}

export interface FullGameConfig {
  user: { regenDividedBy: number; maxHunger: number; [key: string]: any };
  skills: Record<string, SkillConfig>;
  battle: BattleConfig;
  loot: LootConfig;
  items: Record<string, GameItemConfig>;
  upgradesConfig: { headquarters: { levels: Record<string, HQLevel> } };
}

// --- Simulation DTOs ---

export interface EquipmentSlotInput {
  code: string | null;
  stats?: Record<string, number>;
}

export interface ConsumablesInput {
  ammo: 'none' | 'lightAmmo' | 'ammo' | 'heavyAmmo';
  pill: boolean;
  food: 'bread' | 'steak' | 'cookedFish';
}

export interface SkillAllocation {
  [skillName: string]: number; // skill name -> level (0-10)
}

export interface BuildInput {
  skills: SkillAllocation;
  equipment: {
    weapon: EquipmentSlotInput;
    helmet: EquipmentSlotInput;
    chest: EquipmentSlotInput;
    pants: EquipmentSlotInput;
    boots: EquipmentSlotInput;
    gloves: EquipmentSlotInput;
  };
  consumables: ConsumablesInput;
}

export interface SimulationRequest {
  build: BuildInput;
  militaryRank: number;
  militaryRankPercent: number;
  duration: 'burst' | '8h' | '24h';
  bountyPer1kDmg: number;
  battleBonusPercent: number;
  seed?: number;
}

export interface CompareRequest {
  builds: { name: string; build: BuildInput }[];
  militaryRank: number;
  militaryRankPercent: number;
  duration: 'burst' | '8h' | '24h';
  bountyPer1kDmg: number;
  battleBonusPercent: number;
  seed?: number;
}

// --- Simulation output ---

export interface HitLogEntry {
  hitNumber: number;
  type: 'hit' | 'miss' | 'crit';
  damage: number;
  critMultiplier?: number;
  dodged: boolean;
  hpLost: number;
  hpRemaining: number;
  totalDamage: number;
  lootCase1: boolean;
  lootCase2: boolean;
  foodEaten?: string;
  hpHealed?: number;
  equipmentDestroyed?: { slot: string; scraps: number }[];
}

export interface SimulationEvent {
  type: 'header' | 'pill' | 'health' | 'regen' | 'food_regen' | 'total_hp' | 'hit' | 'food' | 'equipment_destroyed' | 'end';
  message: string;
  data?: HitLogEntry;
}

export interface DamageStats {
  totalDamage: number;
  expectedDamage: number;
  avgPerHit: number;
  totalHits: number;
  crits: number;
  critPercent: number;
  misses: number;
  missPercent: number;
  dodges: number;
  dodgePercent: number;
}

export interface CostStats {
  weaponCost: number;
  weaponsUsed: number;
  armorCost: number;
  armorSetsUsed: number;
  ammoCost: number;
  ammoUsed: number;
  foodCost: number;
  foodUsed: number;
  boosterCost: number;
  steelConsumed: number;
  scrapConsumed: number;
  costPer1kDmg: number;
  theoreticalCostPer1kDmg: number;
  total: number;
}

export interface RevenueStats {
  bounty: number;
  casesHit: number;
  casesHitValue: number;
  casesDmg: number;
  casesDmgValue: number;
  scrapCount: number;
  scrapValue: number;
  total: number;
}

export interface NetProfitStats {
  netProfit: number;
  profitPer1k: number;
  roi: number;
  revenue: number;
  costs: number;
  hitRate: number;
  dodgeRate: number;
}

export interface EffectiveStatBreakdown {
  base: number;
  equipment: number;
  total: number;
  overflow?: number;
}

export interface EffectiveStats {
  attack: EffectiveStatBreakdown & { overflow: number };
  precision: EffectiveStatBreakdown;
  critChance: EffectiveStatBreakdown;
  critDamage: EffectiveStatBreakdown & { overflow: number };
  armor: EffectiveStatBreakdown;
  dodge: EffectiveStatBreakdown;
  health: number;
  hunger: number;
  lootChance: number;
}

export interface SimulationResult {
  effectiveStats: EffectiveStats;
  damage: DamageStats;
  costs: CostStats;
  revenue: RevenueStats;
  netProfit: NetProfitStats;
  log: SimulationEvent[];
  warnings: string[];
}

