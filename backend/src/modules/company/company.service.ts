import { Injectable, Logger } from '@nestjs/common';
import { WarEraApiService } from '../warera-api/warera-api.service';
import { PrismaService } from '../../prisma.service';

export interface CompanyData {
  companyId: string;
  userId: string;
  name: string;
  type: string;
  region: string;
  workers: number;
  wagePerWorker: number;
  productionValue: number;
  energyConsumption: number;
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
          } catch (error) {
            // Work offer not found is OK - company might not have one
            this.logger.debug(`No work offer for company ${companyId}`);
          }
          
          const companyDataObj: CompanyData = {
            companyId: company._id || company.id,
            userId,
            name: company.name,
            type: company.itemCode || company.type,
            region: company.region,
            workers: workOffer?.workers || company.workerCount || 0,
            wagePerWorker: workOffer?.wage || 0,
            productionValue: workOffer?.productionValue || company.production || 0,
            energyConsumption: workOffer?.energyConsumption || 10,
          };

          await this.prisma.company.upsert({
            where: { companyId: companyDataObj.companyId },
            update: companyDataObj,
            create: companyDataObj,
          });

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
    return this.prisma.company.findUnique({ where: { companyId } });
  }

  async getCompaniesByUserId(userId: string): Promise<CompanyData[]> {
    return this.prisma.company.findMany({ where: { userId } });
  }
}
