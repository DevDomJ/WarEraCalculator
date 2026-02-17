import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';
import { PrismaService } from '../../prisma.service';
import { ProductionBonusService } from '../production-bonus/production-bonus.service';
import { ProductionCalculatorService } from '../production-calculator/production-calculator.service';

export interface ProductionBonusBreakdown {
  total: number;
  country?: {
    bonus: number;
    countryName: string;
    countryCode: string;
    specializedItem: string;
  };
  deposit?: {
    bonus: number;
    depositType: string;
    /** ISO 8601 date string indicating when the deposit bonus expires */
    endsAt: string;
  };
  party?: {
    bonus: number;
    partyName: string;
    ethicName: string;
  };
}

export interface ProfitMetricsBase {
  dailyOutput: number;
  dailyRevenue: number;
  dailyInputCost: number;
  profitSelfProduction: number;
  profitWithTrade: number;
  costPerUnit: number;
}

export interface DailyProfitMetrics extends ProfitMetricsBase {
  dailyWage: number;
}

export interface WorkerProfitMetrics extends ProfitMetricsBase {
  dailyWage: number;
}

export interface AutomationProfitMetrics extends ProfitMetricsBase {
  // No wage for automation
}

export interface CompanyData {
  companyId: string;
  userId: string;
  name: string;
  type: string;
  region: string;
  productionValue: number;
  maxProduction: number;
  energyConsumption: number;
  workers?: WorkerData[];
  lastFetched?: Date;
  totalDailyWage?: number;
  productionBonus?: ProductionBonusBreakdown;
  dailyProfitMetrics?: DailyProfitMetrics;
  workerProfitMetrics?: WorkerProfitMetrics;
  automationProfitMetrics?: AutomationProfitMetrics;
  automatedEngineLevel?: number;
}

export interface WorkerData {
  workerId: string;
  userId: string;
  username?: string;
  avatarUrl?: string;
  wage: number;
  maxEnergy?: number;
  production?: number;
  fidelity?: number;
  dailyWage?: number;
  paidProduction?: number;
  totalProduction?: number;
  outputUnits?: number;
}

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  // Game mechanics constants
  private readonly ENERGY_REGEN_PER_HOUR = 0.1; // 10% of max energy per hour
  private readonly HOURS_PER_DAY = 24;
  private readonly ENERGY_PER_WORK_ACTION = 10;
  private readonly AUTO_PRODUCTION_POINTS_PER_LEVEL_PER_DAY = 24;

  constructor(
    private readonly apiService: WarEraApiService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ProductionBonusService))
    private readonly productionBonusService: ProductionBonusService,
    @Inject(forwardRef(() => ProductionCalculatorService))
    private readonly productionCalculatorService: ProductionCalculatorService,
  ) {}

  calculateTotalDailyWage(workers: WorkerData[]): number {
    return workers.reduce((sum, w) => {
      if (!w.maxEnergy || !w.production) return sum;
      const energyPerDay = w.maxEnergy * this.ENERGY_REGEN_PER_HOUR * this.HOURS_PER_DAY;
      const ppPerDay = (energyPerDay / this.ENERGY_PER_WORK_ACTION) * w.production;
      return sum + (w.wage * ppPerDay);
    }, 0);
  }

  calculateWorkerDailyWage(worker: WorkerData): number {
    if (!worker.maxEnergy || !worker.production) return 0;
    const energyPerDay = worker.maxEnergy * this.ENERGY_REGEN_PER_HOUR * this.HOURS_PER_DAY;
    const ppPerDay = (energyPerDay / this.ENERGY_PER_WORK_ACTION) * worker.production;
    return worker.wage * ppPerDay;
  }

  calculateWorkerPaidProduction(worker: WorkerData): number {
    if (!worker.maxEnergy || !worker.production) return 0;
    const energyPerDay = worker.maxEnergy * this.ENERGY_REGEN_PER_HOUR * this.HOURS_PER_DAY;
    return (energyPerDay / this.ENERGY_PER_WORK_ACTION) * worker.production;
  }

  calculateWorkerTotalProduction(worker: WorkerData, companyProductionBonus: number): number {
    const paidProduction = this.calculateWorkerPaidProduction(worker);
    const fidelityBonus = (worker.fidelity || 0) / 100;
    return paidProduction * (1 + companyProductionBonus + fidelityBonus);
  }

  async calculateDailyProfitMetrics(
    workers: WorkerData[],
    outputItemCode: string,
    productionPerUnit: number,
  ): Promise<DailyProfitMetrics> {
    const dailyOutput = workers.reduce((sum, w) => sum + (w.outputUnits || 0), 0);
    const outputPrice = await this.getOutputPrice(outputItemCode);
    const dailyRevenue = dailyOutput * outputPrice;
    const dailyWage = workers.reduce((sum, w) => sum + (w.dailyWage || 0), 0);
    const dailyInputCost = await this.calculateInputCost(outputItemCode, dailyOutput);
    
    const totalCosts = dailyWage + dailyInputCost;
    // Cost per unit includes both wage and input costs for worker production
    const costPerUnit = dailyOutput > 0 ? totalCosts / dailyOutput : 0;
    
    return {
      dailyOutput,
      dailyRevenue,
      dailyWage,
      dailyInputCost,
      profitSelfProduction: dailyRevenue - dailyWage,
      profitWithTrade: dailyRevenue - dailyWage - dailyInputCost,
      costPerUnit,
    };
  }

  async calculateWorkerProfitMetrics(
    workers: WorkerData[],
    outputItemCode: string,
    productionPerUnit: number,
  ): Promise<WorkerProfitMetrics> {
    return this.calculateDailyProfitMetrics(workers, outputItemCode, productionPerUnit);
  }

  async calculateAutomationProfitMetrics(
    automatedEngineLevel: number,
    outputItemCode: string,
    productionPerUnit: number,
  ): Promise<AutomationProfitMetrics> {
    const dailyProductionPoints = automatedEngineLevel * this.AUTO_PRODUCTION_POINTS_PER_LEVEL_PER_DAY;
    const dailyOutput = dailyProductionPoints / productionPerUnit;
    const outputPrice = await this.getOutputPrice(outputItemCode);
    const dailyRevenue = dailyOutput * outputPrice;
    const dailyInputCost = await this.calculateInputCost(outputItemCode, dailyOutput);
    
    // Cost per unit only includes input costs (automation has no wage)
    const costPerUnit = dailyOutput > 0 ? dailyInputCost / dailyOutput : 0;
    
    return {
      dailyOutput,
      dailyRevenue,
      dailyInputCost,
      profitSelfProduction: dailyRevenue,
      profitWithTrade: dailyRevenue - dailyInputCost,
      costPerUnit,
    };
  }

  private async getOutputPrice(itemCode: string): Promise<number> {
    const price = await this.prisma.priceHistory.findFirst({
      where: { itemCode },
      orderBy: { timestamp: 'desc' },
    });
    
    if (!price) {
      this.logger.warn(`No price data found for item: ${itemCode}`);
      return 0;
    }
    
    return price.price;
  }

  private async calculateInputCost(outputItemCode: string, dailyOutput: number): Promise<number> {
    const recipe = await this.productionCalculatorService.getRecipeByItemCode(outputItemCode);
    
    if (!recipe || recipe.inputs.length === 0) {
      return 0;
    }
    
    const inputCosts = await Promise.all(
      recipe.inputs.map(async (input) => {
        const price = await this.prisma.priceHistory.findFirst({
          where: { itemCode: input.itemCode },
          orderBy: { timestamp: 'desc' },
        });
        
        if (!price) {
          this.logger.warn(`No price data found for input item: ${input.itemCode}`);
          return 0;
        }
        
        return price.price * input.quantityRequired;
      })
    );
    
    const totalInputCostPerUnit = inputCosts.reduce((sum, cost) => sum + cost, 0);
    return totalInputCostPerUnit * dailyOutput;
  }

  /**
   * Enriches worker data with calculated metrics (daily wage, production, output units)
   * @param worker - Base worker data
   * @param bonusMultiplier - Company production bonus as decimal (e.g., 0.40 for 40%)
   * @param productionPerUnit - Production points required to produce one unit of output
   * @returns Worker data with calculated metrics
   */
  enrichWorkerWithMetrics(worker: WorkerData, bonusMultiplier: number, productionPerUnit: number): WorkerData {
    const totalProduction = this.calculateWorkerTotalProduction(worker, bonusMultiplier);
    
    return {
      ...worker,
      dailyWage: this.calculateWorkerDailyWage(worker),
      paidProduction: this.calculateWorkerPaidProduction(worker),
      totalProduction,
      outputUnits: totalProduction / productionPerUnit,
    };
  }

  async fetchCompaniesByUserId(userId: string): Promise<CompanyData[]> {
    try {
      this.logger.log(`Fetching companies for user ${userId}`);
      
      const allCompanyIds: string[] = [];
      let cursor: string | undefined = undefined;
      
      // Fetch all pages
      do {
        const params: any = { userId, perPage: 100 };
        if (cursor) params.cursor = cursor;
        
        const response = await this.apiService.request<any>('company.getCompanies', params);
        const data = Array.isArray(response) ? response[0] : response;
        
        if (!data?.result?.data?.items) break;
        
        allCompanyIds.push(...data.result.data.items);
        cursor = data.result.data.nextCursor;
      } while (cursor);
      
      this.logger.log(`Found ${allCompanyIds.length} companies total`);
      const companyDataList: CompanyData[] = [];

      for (const companyId of allCompanyIds) {
        try {
          this.logger.debug(`Fetching company ${companyId}`);
          const companyResponse = await this.apiService.request<any>(
            'company.getById',
            { companyId }
          );

          // With batch=1, response is an array
          const companyData = Array.isArray(companyResponse) ? companyResponse[0] : companyResponse;
          this.logger.debug(`Company response for ${companyId}: ${JSON.stringify(companyData).substring(0, 200)}`);
          
          const company = companyData?.result?.data;
          if (!company) {
            this.logger.warn(`No data for company ${companyId}`);
            continue;
          }

          this.logger.debug(`Fetching work offer for ${companyId}`);
          let workOffer = null;
          try {
            const workOfferResponse = await this.apiService.request<any>(
              'workOffer.getWorkOfferByCompanyId',
              { companyId }
            );
            const workOfferData = Array.isArray(workOfferResponse) ? workOfferResponse[0] : workOfferResponse;
            workOffer = workOfferData?.result?.data;
            
            this.logger.log(`=== WORK OFFER DATA for ${company.name} (${companyId}) ===`);
            this.logger.log(`Endpoint: workOffer.getWorkOfferByCompanyId`);
            this.logger.log(`Full Response: ${JSON.stringify(workOfferData, null, 2)}`);
            this.logger.log(`productionValue: ${workOffer?.productionValue}`);
            this.logger.log(`=== END WORK OFFER DATA ===`);
          } catch (error) {
            // Work offer not found is OK - company might not have one
            this.logger.debug(`No work offer for company ${companyId}`);
          }
          
          this.logger.log(`=== COMPANY DATA for ${company.name} (${companyId}) ===`);
          this.logger.log(`Endpoint: company.getById`);
          this.logger.log(`Full company object: ${JSON.stringify(company, null, 2)}`);
          this.logger.log(`company.production: ${company.production}`);
          this.logger.log(`company.maxProduction: ${company.maxProduction}`);
          this.logger.log(`Final productionValue used: ${workOffer?.productionValue || company.production || 0}`);
          this.logger.log(`=== END COMPANY DATA ===`);

          // Fetch workers
          this.logger.debug(`Fetching workers for ${companyId}`);
          let workers: WorkerData[] = [];
          try {
            const workersResponse = await this.apiService.request<any>(
              'worker.getWorkers',
              { companyId }
            );
            const workersData = Array.isArray(workersResponse) ? workersResponse[0] : workersResponse;
            const workersList = workersData?.result?.data?.workers || [];
            
            this.logger.debug(`Worker raw data: ${JSON.stringify(workersList)}`);
            
            // Fetch user data for each worker to get maxEnergy and production
            workers = await Promise.all(workersList.map(async (w: any) => {
              try {
                const userResponse = await this.apiService.request<any>(
                  'user.getUserLite',
                  { userId: w.user || w.userId }
                );
                const userData = Array.isArray(userResponse) ? userResponse[0] : userResponse;
                const user = userData?.result?.data;
                
                const workerData = {
                  workerId: w._id || w.id,
                  userId: w.user || w.userId,
                  username: user?.username || 'Unknown',
                  avatarUrl: user?.avatarUrl || null,
                  wage: w.wage || 0,
                  maxEnergy: user?.skills?.energy?.total || 70,
                  production: user?.skills?.production?.total || 0,
                  fidelity: w.fidelity || 0,
                };
                
                return {
                  ...workerData,
                  dailyWage: this.calculateWorkerDailyWage(workerData),
                };
              } catch (error) {
                this.logger.debug(`Failed to fetch user data for worker ${w._id}: ${error.message}`);
                const workerData = {
                  workerId: w._id || w.id,
                  userId: w.user || w.userId,
                  username: 'Unknown',
                  avatarUrl: null,
                  wage: w.wage || 0,
                  maxEnergy: 70,
                  production: 0,
                  fidelity: 0,
                };
                
                return {
                  ...workerData,
                  dailyWage: this.calculateWorkerDailyWage(workerData),
                };
              }
            }));
            
            this.logger.debug(`Fetched ${workers.length} workers with user data`);
          } catch (error) {
            this.logger.debug(`Failed to fetch workers for company ${companyId}: ${error.message}`);
          }
          
          // Get max production from storage level
          const storageLevel = company.activeUpgradeLevels?.storage || 1;
          const maxProductionByLevel = {
            1: 200, 2: 400, 3: 600, 4: 800, 5: 1000, 6: 1200,
            7: 1400, 8: 1600, 9: 1800, 10: 2000
          };
          const maxProduction = maxProductionByLevel[storageLevel] || 200;

          // Get production bonus for worker calculations
          const productionBonus = await this.productionBonusService.calculateProductionBonus(
            company.region,
            company.itemCode || company.type,
          );
          const bonusMultiplier = productionBonus.total / 100;

          // Get recipe for output calculation
          const recipe = await this.productionCalculatorService.getRecipeByItemCode(company.itemCode || company.type);
          const productionPerUnit = recipe?.productionPoints || 1;

          // Enrich workers with calculated metrics
          const workersWithProduction = workers.map(w => 
            this.enrichWorkerWithMetrics(w, bonusMultiplier, productionPerUnit)
          );

          const companyDataObj: CompanyData = {
            companyId: company._id || company.id,
            userId,
            name: company.name,
            type: company.itemCode || company.type,
            region: company.region,
            productionValue: company.production || 0,
            maxProduction,
            energyConsumption: workOffer?.energyConsumption || 10,
            automatedEngineLevel: company.activeUpgradeLevels?.automatedEngine || 0,
            workers: workersWithProduction,
            lastFetched: new Date(),
            productionBonus,
          };

          await this.prisma.company.upsert({
            where: { companyId: companyDataObj.companyId },
            update: {
              userId: companyDataObj.userId,
              name: companyDataObj.name,
              type: companyDataObj.type,
              region: companyDataObj.region,
              productionValue: companyDataObj.productionValue,
              maxProduction: companyDataObj.maxProduction,
              energyConsumption: companyDataObj.energyConsumption,
              automatedEngineLevel: companyDataObj.automatedEngineLevel,
              lastFetched: companyDataObj.lastFetched,
            },
            create: {
              companyId: companyDataObj.companyId,
              userId: companyDataObj.userId,
              name: companyDataObj.name,
              type: companyDataObj.type,
              region: companyDataObj.region,
              productionValue: companyDataObj.productionValue,
              maxProduction: companyDataObj.maxProduction,
              energyConsumption: companyDataObj.energyConsumption,
              automatedEngineLevel: companyDataObj.automatedEngineLevel,
              lastFetched: companyDataObj.lastFetched,
            },
          });

          // Update workers
          await this.prisma.worker.deleteMany({ where: { companyId: companyDataObj.companyId } });
          if (workers.length > 0) {
            await this.prisma.worker.createMany({
              data: workers.map(w => ({
                workerId: w.workerId,
                companyId: companyDataObj.companyId,
                userId: w.userId,
                username: w.username || 'Unknown',
                avatarUrl: w.avatarUrl || null,
                wage: w.wage,
                maxEnergy: w.maxEnergy || 70,
                production: w.production || 0,
                fidelity: w.fidelity || 0,
              })),
            });
          }

          companyDataList.push(companyDataObj);
        } catch (error) {
          this.logger.error(`Failed to fetch company ${companyId}`, error.message || error);
          continue;
        }
      }

      return companyDataList;
    } catch (error) {
      this.logger.error('Failed to fetch companies', error);
      throw error;
    }
  }

  async getCompanyById(companyId: string): Promise<CompanyData | null> {
    const company = await this.prisma.company.findUnique({ 
      where: { companyId },
      include: { workers: true }
    });
    
    if (!company) return null;
    
    // Get production bonus
    const productionBonus = await this.productionBonusService.calculateProductionBonus(
      company.region,
      company.type,
    );
    const bonusMultiplier = productionBonus.total / 100;
    
    // Get recipe for output calculation
    const recipe = await this.productionCalculatorService.getRecipeByItemCode(company.type);
    const productionPerUnit = recipe?.productionPoints || 1;
    
    const workers = company.workers.map(w => 
      this.enrichWorkerWithMetrics(
        {
          workerId: w.workerId,
          userId: w.userId,
          username: w.username,
          avatarUrl: w.avatarUrl,
          wage: w.wage,
          maxEnergy: w.maxEnergy,
          production: w.production,
          fidelity: w.fidelity,
        },
        bonusMultiplier,
        productionPerUnit
      )
    );
    
    // Calculate worker profit metrics
    const workerProfitMetrics = workers.length > 0 
      ? await this.calculateWorkerProfitMetrics(workers, company.type, productionPerUnit)
      : null;
    
    // Calculate automation profit metrics
    const automationProfitMetrics = company.automatedEngineLevel > 0
      ? await this.calculateAutomationProfitMetrics(company.automatedEngineLevel, company.type, productionPerUnit)
      : null;
    
    // Calculate total daily profit metrics (sum of worker + automation)
    let dailyProfitMetrics: DailyProfitMetrics | null = null;
    if (workerProfitMetrics || automationProfitMetrics) {
      const totalDailyOutput = (workerProfitMetrics?.dailyOutput || 0) + (automationProfitMetrics?.dailyOutput || 0);
      const totalDailyWage = workerProfitMetrics?.dailyWage || 0;
      const totalDailyInputCost = (workerProfitMetrics?.dailyInputCost || 0) + (automationProfitMetrics?.dailyInputCost || 0);
      const totalCosts = totalDailyWage + totalDailyInputCost;
      
      dailyProfitMetrics = {
        dailyOutput: totalDailyOutput,
        dailyRevenue: (workerProfitMetrics?.dailyRevenue || 0) + (automationProfitMetrics?.dailyRevenue || 0),
        dailyWage: totalDailyWage,
        dailyInputCost: totalDailyInputCost,
        profitSelfProduction: (workerProfitMetrics?.profitSelfProduction || 0) + (automationProfitMetrics?.profitSelfProduction || 0),
        profitWithTrade: (workerProfitMetrics?.profitWithTrade || 0) + (automationProfitMetrics?.profitWithTrade || 0),
        costPerUnit: totalDailyOutput > 0 ? totalCosts / totalDailyOutput : 0,
      };
    }
    
    return {
      ...company,
      workers,
      totalDailyWage: this.calculateTotalDailyWage(workers),
      productionBonus,
      workerProfitMetrics,
      automationProfitMetrics,
      dailyProfitMetrics,
    };
  }

  async getCompaniesByUserId(userId: string): Promise<CompanyData[]> {
    const companies = await this.prisma.company.findMany({ 
      where: { userId },
      include: { workers: true },
      orderBy: { displayOrder: 'asc' }
    });
    
    return companies.map(company => {
      const workers = company.workers.map(w => ({
        workerId: w.workerId,
        userId: w.userId,
        username: w.username,
        avatarUrl: w.avatarUrl,
        wage: w.wage,
        maxEnergy: w.maxEnergy,
        production: w.production,
        fidelity: w.fidelity,
      }));
      
      return {
        ...company,
        workers,
        totalDailyWage: this.calculateTotalDailyWage(workers),
      };
    });
  }

  async updateCompanyOrder(companyIds: string[]): Promise<void> {
    await Promise.all(
      companyIds.map((companyId, index) =>
        this.prisma.company.updateMany({
          where: { companyId },
          data: { displayOrder: index },
        })
      )
    );
  }
}
