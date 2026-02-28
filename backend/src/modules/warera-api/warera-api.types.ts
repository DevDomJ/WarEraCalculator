/**
 * Type definitions for WarEra tRPC API responses.
 *
 * The API uses tRPC batch format: responses are arrays where each element
 * wraps the actual data in `{ result: { data: ... } }`.
 */

/** Generic tRPC batch response wrapper */
export interface TrpcBatchResponse<T> {
  result: { data: T };
}

/** Unwrap helper: the raw response from `request()` with batch=1 is always a single-element array */
export type TrpcResponse<T> = TrpcBatchResponse<T>[];

// --- itemTrading ---

/** itemTrading.getPrices → Record<itemCode, price> */
export type PricesResponse = TrpcResponse<Record<string, number>>;

// --- tradingOrder ---

export interface TradingOrderData {
  price: number;
  quantity: number;
}

export interface TopOrdersData {
  buyOrders: TradingOrderData[];
  sellOrders: TradingOrderData[];
}

export type TopOrdersResponse = TrpcBatchResponse<TopOrdersData>;

// --- gameConfig ---

export interface GameConfigItemRaw {
  code?: string;
  id?: string;
  name?: string;
  displayName?: string;
  icon?: string;
  iconUrl?: string;
  productionPoints?: number;
  productionNeeds?: Record<string, number>;
}

export interface GameConfigData {
  items: GameConfigItemRaw[] | Record<string, GameConfigItemRaw>;
}

export type GameConfigResponse = TrpcResponse<GameConfigData>;

// --- company ---

export interface ProductionBonusData {
  total: number;
  strategicBonus: number;
  depositBonus: number;
  ethicSpecializationBonus: number;
  ethicDepositBonus: number;
}

export type ProductionBonusResponse = TrpcResponse<ProductionBonusData>;

export interface CompanyRaw {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  itemCode?: string;
  region: string;
  production: number;
  maxProduction: number;
  energyConsumption: number;
  user: string;
  activeUpgradeLevels?: Record<string, number>;
}

export type CompanyByIdResponse = TrpcResponse<CompanyRaw>;

export interface CompanyListData {
  items: string[];
  nextCursor?: string;
}

export type CompanyListResponse = TrpcResponse<CompanyListData>;

// --- workOffer ---

export interface WorkOfferRaw {
  productionValue: number;
  wage?: number;
  energyConsumption?: number;
  [key: string]: unknown;
}

export type WorkOfferResponse = TrpcResponse<WorkOfferRaw>;

// --- worker ---

export interface WorkerRaw {
  _id?: string;
  id?: string;
  user?: string;
  userId?: string;
  wage?: number;
  fidelity?: number;
  [key: string]: unknown;
}

export interface WorkersData {
  workers: WorkerRaw[];
}

export type WorkersResponse = TrpcResponse<WorkersData>;

// --- user ---

export interface UserLiteData {
  username: string;
  avatarUrl?: string;
  animatedAvatarUrl?: string;
  maxEnergy?: number;
  leveling?: { level: number };
  militaryRank?: string;
  skills?: {
    attack?: { total: number };
    energy?: { total: number };
    production?: { total: number };
  };
  stats?: { damagesCount?: number };
  dates?: { lastConnectionAt?: string };
}

export type UserLiteResponse = TrpcResponse<UserLiteData>;

// --- work ---

export interface WorkerDailyStatRaw {
  dailyDate: string;
  total: number;
  wage: number;
  employeeProd: number;
  selfWork?: number;
  automatedEngine?: number;
}

export type WorkerStatsResponse = TrpcResponse<WorkerDailyStatRaw[]>;

// --- mu ---

export interface MuRaw {
  _id: string;
  name: string;
  avatarUrl?: string;
  region?: string;
  user: string;
  members?: string[];
  roles?: { commanders?: string[] };
  activeUpgradeLevels?: Record<string, number>;
  rankings?: unknown;
}

export interface MuListData {
  items: MuRaw[];
  nextCursor?: string;
}

export type MuListResponse = TrpcResponse<MuListData>;
export type MuByIdResponse = TrpcResponse<MuRaw>;

// --- transaction ---

export interface TransactionRaw {
  createdAt: string;
  buyerId: string;
  money?: number;
  [key: string]: unknown;
}

export interface TransactionListData {
  items: TransactionRaw[];
  nextCursor?: string;
}

export type TransactionListResponse = TrpcResponse<TransactionListData>;

// --- Helper to extract data from a tRPC batch response ---

/** Extract the inner data from a tRPC batch response (handles both array and single-object formats) */
export function extractData<T>(response: TrpcResponse<T> | TrpcBatchResponse<T>): T | undefined {
  const entry = Array.isArray(response) ? response[0] : response;
  return entry?.result?.data;
}
