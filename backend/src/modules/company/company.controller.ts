import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('fetch')
  async fetchCompanies(@Body('userId') userId: string) {
    return this.companyService.fetchCompaniesByUserId(userId);
  }

  @Get('user/:userId')
  async getCompaniesByUser(@Param('userId') userId: string) {
    return this.companyService.getCompaniesByUserId(userId);
  }

  @Get(':id')
  async getCompany(@Param('id') id: string) {
    return this.companyService.getCompanyById(id);
  }

  @Post(':id/refresh')
  async refreshCompany(@Param('id') id: string) {
    const company = await this.companyService.getCompanyById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    // Refetch from API
    const companies = await this.companyService.fetchCompaniesByUserId(company.userId);
    return companies.find(c => c.companyId === id);
  }
}
