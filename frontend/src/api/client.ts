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
}

export interface ProductionBonusBreakdown {
  total: number
  country?: {
    bonus: number
    countryName: string
    countryCode: string
    specializedItem: string
  }
  deposit?: {
    bonus: number
    depositType: string
    /** ISO 8601 date string indicating when the deposit bonus expires */
    endsAt: string
  }
  party?: {
    bonus: number
    partyName: string
    ethicName: string
  }
}

export interface ProfitMetricsBase {
  dailyOutput: number
  dailyRevenue: number
  dailyInputCost: number
  profitSelfProduction: number
  profitWithTrade: number
  costPerUnit: number
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

export interface Company {
  companyId: string
  userId: string
  name: string
  type: string
  region: string
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
    api.get<Company[]>(`/companies/user/${userId}`).then(res => res.data),
  refreshByUserId: (userId: string) =>
    api.post<Company[]>(`/companies/user/${userId}/refresh`).then(res => res.data),
  getById: (id: string) => 
    api.get<Company>(`/companies/${id}`).then(res => res.data),
  refresh: (id: string) =>
    api.post<Company>(`/companies/${id}/refresh`).then(res => res.data),
  reorder: (companyIds: string[]) =>
    api.post('/companies/reorder', { companyIds }).then(res => res.data),
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

export const analyticsApi = {
  trackProduction: (companyId: string, actualPP: number, expectedPP: number) =>
    api.post(`/analytics/${companyId}/track`, { actualPP, expectedPP }).then(res => res.data),
  getHistory: (companyId: string, days = 30) =>
    api.get<ProductionHistoryEntry[]>(`/analytics/${companyId}/history?days=${days}`).then(res => res.data),
  getAnalytics: (companyId: string, days = 30) =>
    api.get<ProductionAnalytics>(`/analytics/${companyId}?days=${days}`).then(res => res.data),
}
