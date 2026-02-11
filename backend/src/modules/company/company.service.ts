import { Injectable, Logger } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';
import { PrismaService } from '../../prisma.service';

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
}

export interface WorkerData {
  workerId: string;
  userId: string;
  username?: string;
  avatarUrl?: string;
  wage: number;
  maxEnergy?: number;
  production?: number;
}

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly apiService: WarEraApiService,
    private readonly prisma: PrismaService,
  ) {}

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
            
            // Fetch user data for each worker to get maxEnergy and production
            workers = await Promise.all(workersList.map(async (w: any) => {
              try {
                const userResponse = await this.apiService.request<any>(
                  'user.getUserLite',
                  { userId: w.user || w.userId }
                );
                const userData = Array.isArray(userResponse) ? userResponse[0] : userResponse;
                const user = userData?.result?.data;
                
                return {
                  workerId: w._id || w.id,
                  userId: w.user || w.userId,
                  username: user?.username || 'Unknown',
                  avatarUrl: user?.avatarUrl || null,
                  wage: w.wage || 0,
                  maxEnergy: user?.skills?.energy?.total || 70,
                  production: user?.skills?.production?.total || 0,
                };
              } catch (error) {
                this.logger.debug(`Failed to fetch user data for worker ${w._id}: ${error.message}`);
                return {
                  workerId: w._id || w.id,
                  userId: w.user || w.userId,
                  username: 'Unknown',
                  avatarUrl: null,
                  wage: w.wage || 0,
                  maxEnergy: 70,
                  production: 0,
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

          const companyDataObj: CompanyData = {
            companyId: company._id || company.id,
            userId,
            name: company.name,
            type: company.itemCode || company.type,
            region: company.region,
            productionValue: company.production || 0,
            maxProduction,
            energyConsumption: workOffer?.energyConsumption || 10,
            workers,
            lastFetched: new Date(),
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
    
    return {
      ...company,
      workers: company.workers.map(w => ({
        workerId: w.workerId,
        userId: w.userId,
        username: w.username,
        avatarUrl: w.avatarUrl,
        wage: w.wage,
        maxEnergy: w.maxEnergy,
        production: w.production,
      })),
    };
  }

  async getCompaniesByUserId(userId: string): Promise<CompanyData[]> {
    const companies = await this.prisma.company.findMany({ 
      where: { userId },
      include: { workers: true }
    });
    
    return companies.map(company => ({
      ...company,
      workers: company.workers.map(w => ({
        workerId: w.workerId,
        userId: w.userId,
        username: w.username,
        avatarUrl: w.avatarUrl,
        wage: w.wage,
        maxEnergy: w.maxEnergy,
        production: w.production,
      })),
    }));
  }
}
