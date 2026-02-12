import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ProductionBonusService } from '../production-bonus/production-bonus.service';

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly productionBonusService: ProductionBonusService,
  ) {}

  @Post('fetch')
  async fetchCompanies(@Body('userId') userId: string) {
    return this.companyService.fetchCompaniesByUserId(userId);
  }

  @Get('user/:userId')
  async getCompaniesByUser(@Param('userId') userId: string) {
    const companies = await this.companyService.getCompaniesByUserId(userId);
    
    // Add production bonus to each company
    return Promise.all(
      companies.map(async (company) => {
        const productionBonus = await this.productionBonusService.calculateProductionBonus(
          company.region,
          company.type,
        );
        return { ...company, productionBonus };
      })
    );
  }

  @Post('user/:userId/refresh')
  async refreshCompaniesByUser(@Param('userId') userId: string) {
    // Refetch from API to update database
    await this.companyService.fetchCompaniesByUserId(userId);
    // Return updated companies with fresh production bonus
    const companies = await this.companyService.getCompaniesByUserId(userId);
    
    return Promise.all(
      companies.map(async (company) => {
        const productionBonus = await this.productionBonusService.calculateProductionBonus(
          company.region,
          company.type,
          true, // Force refresh
        );
        return { ...company, productionBonus };
      })
    );
  }

  @Get(':id')
  async getCompany(@Param('id') id: string) {
    const company = await this.companyService.getCompanyById(id);
    if (!company) return null;
    
    // Add production bonus
    const productionBonus = await this.productionBonusService.calculateProductionBonus(
      company.region,
      company.type,
    );
    
    return { ...company, productionBonus };
  }

  @Post(':id/refresh')
  async refreshCompany(@Param('id') id: string) {
    const company = await this.companyService.getCompanyById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    // Refetch from API to update database
    await this.companyService.fetchCompaniesByUserId(company.userId);
    // Return updated company from database with fresh production bonus
    const updatedCompany = await this.companyService.getCompanyById(id);
    if (!updatedCompany) return null;
    
    const productionBonus = await this.productionBonusService.calculateProductionBonus(
      updatedCompany.region,
      updatedCompany.type,
      true, // Force refresh
    );
    
    return { ...updatedCompany, productionBonus };
  }

  @Post('reorder')
  async reorderCompanies(@Body() body: { companyIds: string[] }) {
    return this.companyService.updateCompanyOrder(body.companyIds);
  }
}
