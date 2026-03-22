import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export interface Item {
  code: string
  name: string
  displayName?: string
  icon?: string
  order: number
  currentPrice?: number
  category?: string
}

export interface PriceHistory {
  id: number
  itemCode: string
  price: number
  volume: number
  highestBuy?: number
  lowestSell?: number
  timestamp: string
}

export interface TradingOrder {
  id: number
  itemCode: string
  type: 'buy' | 'sell'
  price: number
  quantity: number
  timestamp: string
}

export interface Worker {
  workerId: string
  userId: string
  username?: string
  avatarUrl?: string
  wage: number
  maxEnergy?: number
  production?: number
  fidelity?: number
  dailyWage?: number
  paidProduction?: number
  totalProduction?: number
  outputUnits?: number
  avgDailyProduction?: number
}

export interface WorkerDailyStat {
  dailyDate: string
  total: number
  wage: number
  employeeProd: number
}

export interface ProductionBonusBreakdown {
  total: number
  strategicBonus: number
  depositBonus: number
  ethicSpecializationBonus: number
  ethicDepositBonus: number
}

export interface ProfitMetricsBase {
  dailyOutput: number
  dailyRevenue: number
  dailyInputCost: number
  profit: number
  costPerUnit: number
  formulas: {
    dailyOutput: string
    dailyRevenue: string
    dailyInputCost: string
    profit: string
    costPerUnit: string
  }
}

export interface DailyProfitMetrics extends ProfitMetricsBase {
  dailyWage: number
}

export interface WorkerProfitMetrics extends ProfitMetricsBase {
  dailyWage: number
}

export interface AutomationProfitMetrics extends ProfitMetricsBase {
  // No wage for automation
}

export interface CompaniesSummary {
  totalDailyRevenue: number
  totalDailyWage: number
  totalDailyInputCost: number
  totalDailyProfit: number
}

export interface CompaniesResponse {
  companies: Company[]
  summary: CompaniesSummary
}

export interface ProfitSimulatorData {
  outputPrice: number
  inputCostPerUnit: number
  effectivePPPerUnit: number
  maxProfitableWage: number | null
}

export interface Company {
  companyId: string
  userId: string
  name: string
  type: string
  region: string
  regionName?: string
  countryCode?: string
  productionValue: number
  maxProduction: number
  energyConsumption: number
  automatedEngineLevel?: number
  lastFetched?: string
  workers?: Worker[]
  totalDailyWage?: number
  productionBonus?: ProductionBonusBreakdown
  dailyProfitMetrics?: DailyProfitMetrics
  workerProfitMetrics?: WorkerProfitMetrics
  automationProfitMetrics?: AutomationProfitMetrics
  profitSimulatorData?: ProfitSimulatorData
}

export interface ProductionMetrics {
  productionPointsPerWork: number
  workActionsPerDay: number
  totalProductionPointsPerDay: number
  formula: {
    ppPerWork: string
    actionsPerDay: string
    totalPP: string
  }
}

export interface ProfitScenario {
  revenue: number
  costs: number
  profit: number
  profitPerPP: number
  breakdown: any
}

export interface ProductionHistoryEntry {
  date: string
  actualPP: number
  expectedPP: number
  variance: number
}

export interface ProductionAnalytics {
  averageVariance: number
  totalActualPP: number
  totalExpectedPP: number
  efficiency: number
  history: ProductionHistoryEntry[]
}

export const itemsApi = {
  getAll: () => api.get<Item[]>('/items').then(res => res.data),
  getByCode: (code: string) => api.get<Item>(`/items/${code}`).then(res => res.data),
}

export const pricesApi = {
  getHistory: (itemCode: string, days = 30) => 
    api.get<PriceHistory[]>(`/prices/${itemCode}?days=${days}`).then(res => res.data),
  getOrders: (itemCode: string) => 
    api.get<{ buyOrders: TradingOrder[], sellOrders: TradingOrder[] }>(`/prices/${itemCode}/orders`).then(res => res.data),
}

export const companyApi = {
  fetchByUserId: (userId: string) => 
    api.post<Company[]>('/companies/fetch', { userId }).then(res => res.data),
  getByUserId: (userId: string) => 
    api.get<CompaniesResponse>(`/companies/user/${userId}`).then(res => res.data),
  refreshByUserId: (userId: string) =>
    api.post<CompaniesResponse>(`/companies/user/${userId}/refresh`).then(res => res.data),
  getById: (id: string) => 
    api.get<Company>(`/companies/${id}`).then(res => res.data),
  refresh: (id: string) =>
    api.post<Company>(`/companies/${id}/refresh`).then(res => res.data),
  reorder: (companyIds: string[]) =>
    api.post('/companies/reorder', { companyIds }).then(res => res.data),
  getWorkerStats: (companyId: string, workerId: string, days = 30) =>
    api.get<WorkerDailyStat[]>(`/companies/${companyId}/worker/${workerId}/stats?days=${days}`).then(res => res.data),
}

export const productionApi = {
  getRecipes: () => 
    api.get('/production/recipes').then(res => res.data),
  getMetrics: (companyId: string, productionBonus?: number) => 
    api.get<ProductionMetrics>(`/production/${companyId}/metrics`, { 
      params: { productionBonus } 
    }).then(res => res.data),
  calculateProfit: (companyId: string, outputItem: string, productionBonus?: number) => 
    api.get<{ scenarioA: ProfitScenario, scenarioB: ProfitScenario | null }>(
      `/production/${companyId}/profit`,
      { params: { outputItem, productionBonus } }
    ).then(res => res.data),
}

export interface MuSummary {
  id: string
  name: string
  avatarUrl?: string
  memberCount: number
}

export interface MuMember {
  userId: string
  username?: string
  avatarUrl?: string
  level?: number
  militaryRank?: number
  totalDamage?: number
  attack?: number
  isOwner: boolean
  isCommander: boolean
  donation: number
  lastLoginAgo?: string | null
  inactive: boolean
}

export interface MuDetail {
  id: string
  name: string
  avatarUrl?: string
  region: string
  ownerId: string
  memberCount: number
  upgrades: { headquarters: number; dormitories: number }
  rankings: Record<string, { value: number; rank: number; tier: string }>
  members: MuMember[]
}

export interface UserMusResponse {
  memberOf: MuSummary | null
  owned: MuSummary[]
}

export const muApi = {
  getUserMus: (userId: string) =>
    api.get<UserMusResponse>(`/mu/user/${userId}`).then(res => res.data),
  getDetail: (muId: string) =>
    api.get<MuDetail>(`/mu/${muId}`).then(res => res.data),
}

export const analyticsApi = {
  trackProduction: (companyId: string, actualPP: number, expectedPP: number) =>
    api.post(`/analytics/${companyId}/track`, { actualPP, expectedPP }).then(res => res.data),
  getHistory: (companyId: string, days = 30) =>
    api.get<ProductionHistoryEntry[]>(`/analytics/${companyId}/history?days=${days}`).then(res => res.data),
  getAnalytics: (companyId: string, days = 30) =>
    api.get<ProductionAnalytics>(`/analytics/${companyId}?days=${days}`).then(res => res.data),
}

// --- Recommendations ---

export interface RecommendationProfitMetrics extends ProfitMetricsBase {
  profitPerPP: number
}

export interface ItemRecommendation {
  bestRegion: {
    regionId: string
    regionName: string
    countryCode: string
    countryName: string
  }
  bonus: ProductionBonusBreakdown
  depositExpiresAt?: string
  profitMetrics: RecommendationProfitMetrics
  engineLevel: number
}

export interface TopRegionEntry {
  regionId: string
  regionName: string
  countryCode: string
  countryName: string
  bonus: ProductionBonusBreakdown
  depositExpiresAt?: string
  profitMetrics: RecommendationProfitMetrics
}

export interface ItemRecommendationDetail extends ItemRecommendation {
  topRegions: TopRegionEntry[]
}

export const recommendationApi = {
  getAll: (engineLevel = 4) =>
    api.get<Record<string, ItemRecommendation>>(`/recommendations?engineLevel=${engineLevel}`).then(res => res.data),
  getByItem: (itemCode: string, engineLevel = 4) =>
    api.get<ItemRecommendationDetail>(`/recommendations/${itemCode}?engineLevel=${engineLevel}`).then(res => res.data),
}
