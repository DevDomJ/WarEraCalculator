import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// --- Types ---

export interface SkillLevelConfig {
  value: number
  totalCost: number
  cost?: number
  isABar?: boolean
  unlockAtLevel: number
}

export interface SkillConfig {
  levels: Record<string, SkillLevelConfig>
  skillOverflow?: string
  skillOverflowValue?: number
  softCap?: number
}

export interface GameItemConfig {
  type: string
  code: string
  usage?: string
  rarity: string
  dynamicStats?: Record<string, [number, number]>
  flatStats?: Record<string, number>
  isConsumable?: boolean
}

export interface HQLevel {
  level: number
  steelCost: number
  maintenanceCost: number
  stats: { attackBonus: number }
}

export interface BattleConfig {
  healthCost: number
  countryOrderBonusPercent: number
  muOrderBonusPercent: number
  allianceDamagesBonusPercent: number
  enemyDamagesBonusPercent: number
  patrioticBonusPercent: number
  regionNotLinkedToCapitalMalusPercent: number
  lostAttackingRegionMalusPercent: number
  occupyingYourRegionsMalusPercent: number
  govMemberBountyRewardPercent: number
}

export interface LootConfig {
  weaponChancePercent: number
  damagePerLootItem: number
  battleLootDamagePerLootItem: number
}

export interface UserSkillData {
  level: number
  currentBarValue?: number
  value: number | null
  weapon: number | null
  equipment: number | null
  limited: number | null
  total: number
  totalAfterSoftCap: number | null
  hourlyBarRegen?: number
  overflow: number | null
  ammoPercent?: number
  buffsPercent?: number
  debuffsPercent?: number
  militaryRankPercent?: number
}

export interface UserLeveling {
  level: number
  totalXp: number
  availableSkillPoints: number
  spentSkillPoints: number
  totalSkillPoints: number
  freeReset: number
}

export interface EquipmentItemData {
  _id: string
  code: string
  type?: string
  skills: Record<string, number>
  state: number
  maxState: number
  quantity: number
}

export interface CurrentEquipmentData {
  weapon?: EquipmentItemData
  helmet?: EquipmentItemData
  chest?: EquipmentItemData
  pants?: EquipmentItemData
  boots?: EquipmentItemData
  gloves?: EquipmentItemData
  ammo?: string
  ammoQuantity?: number
}

export interface UserSkillsResponse {
  userId: string
  username: string
  militaryRank: number
  militaryRankPercent: number
  leveling: UserLeveling
  skills: Record<string, UserSkillData>
  equipment: CurrentEquipmentData
  gameConfig: GameConfigResponse
}

// --- Simulation types ---

export interface EquipmentSlotInput {
  code: string | null
  stats?: Record<string, number>
}

export interface ConsumablesInput {
  ammo: 'none' | 'lightAmmo' | 'ammo' | 'heavyAmmo'
  pill: boolean
  food: 'bread' | 'steak' | 'cookedFish'
}

export interface BuildInput {
  skills: Record<string, number>
  equipment: Record<string, EquipmentSlotInput>
  consumables: ConsumablesInput
}

export interface SimulationRequest {
  build: BuildInput
  militaryRank: number
  militaryRankPercent: number
  duration: 'burst' | '8h' | '24h'
  bountyPer1kDmg: number
  battleBonusPercent: number
  seed?: number
}

export interface HitLogEntry {
  hitNumber: number
  type: 'hit' | 'miss' | 'crit'
  damage: number
  critMultiplier?: number
  dodged: boolean
  hpLost: number
  hpRemaining: number
  totalDamage: number
  lootCase1: boolean
  lootCase2: boolean
  foodEaten?: string
  hpHealed?: number
  equipmentDestroyed?: { slot: string; scraps: number }[]
}

export interface SimulationEvent {
  type: string
  message: string
  data?: HitLogEntry
}

export interface DamageStats {
  totalDamage: number
  expectedDamage: number
  avgPerHit: number
  totalHits: number
  crits: number
  critPercent: number
  misses: number
  missPercent: number
  dodges: number
  dodgePercent: number
}

export interface CostStats {
  weaponCost: number
  weaponsUsed: number
  armorCost: number
  armorSetsUsed: number
  ammoCost: number
  ammoUsed: number
  foodCost: number
  foodUsed: number
  boosterCost: number
  steelConsumed: number
  scrapConsumed: number
  costPer1kDmg: number
  theoreticalCostPer1kDmg: number
  total: number
}

export interface RevenueStats {
  bounty: number
  casesHit: number
  casesHitValue: number
  casesDmg: number
  casesDmgValue: number
  scrapCount: number
  scrapValue: number
  total: number
}

export interface NetProfitStats {
  netProfit: number
  profitPer1k: number
  roi: number
  revenue: number
  costs: number
  hitRate: number
  dodgeRate: number
}

export interface EffectiveStatBreakdown {
  base: number
  equipment: number
  total: number
  overflow?: number
}

export interface EffectiveStats {
  attack: EffectiveStatBreakdown & { overflow: number }
  precision: EffectiveStatBreakdown
  critChance: EffectiveStatBreakdown
  critDamage: EffectiveStatBreakdown & { overflow: number }
  armor: EffectiveStatBreakdown
  dodge: EffectiveStatBreakdown
  health: number
  hunger: number
  lootChance: number
}

export interface SimulationResult {
  effectiveStats: EffectiveStats
  damage: DamageStats
  costs: CostStats
  revenue: RevenueStats
  netProfit: NetProfitStats
  log: SimulationEvent[]
  warnings: string[]
}

// --- Saved build type ---

export interface SavedBuild {
  name: string
  skills: Record<string, number>
  equipment: Record<string, EquipmentSlotInput>
  consumables: ConsumablesInput
}

export interface CompareRequest {
  builds: { name: string; build: BuildInput }[]
  militaryRank: number
  militaryRankPercent: number
  duration: 'burst' | '8h' | '24h'
  bountyPer1kDmg: number
  battleBonusPercent: number
  seed?: number
}

export interface CompareResult {
  name: string
  result: SimulationResult
}

export interface GameConfigResponse {
  skills: Record<string, SkillConfig>
  battle: BattleConfig
  loot: LootConfig
  items: Record<string, GameItemConfig>
  hqLevels: Record<string, HQLevel>
  regenDividedBy: number
  maxHunger: number
  skillPointsPerLevel: number
  maxLevel: number
}

// --- API ---

export const battleSimApi = {
  getGameConfig: () =>
    api.get<GameConfigResponse>('/battle-sim/game-config').then(r => r.data),
  getUserSkills: (userId: string) =>
    api.get<UserSkillsResponse>(`/battle-sim/user-skills/${userId}`).then(r => r.data),
  simulate: (req: SimulationRequest) =>
    api.post<SimulationResult>('/battle-sim/simulate', req).then(r => r.data),
  compare: (req: CompareRequest) =>
    api.post<CompareResult[]>('/battle-sim/compare', req).then(r => r.data),
}
