import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
  ) {}

  @Post('fetch')
  async fetchCompanies(@Body('userId') userId: string) {
    return this.companyService.fetchCompaniesByUserId(userId);
  }

  @Get('user/:userId')
  async getCompaniesByUser(@Param('userId') userId: string) {
    return this.companyService.getCompaniesByUserId(userId);
  }

  @Post('user/:userId/refresh')
  async refreshCompaniesByUser(@Param('userId') userId: string) {
    await this.companyService.fetchCompaniesByUserId(userId);
    return this.companyService.getCompaniesByUserId(userId, true);
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
    await this.companyService.fetchCompaniesByUserId(company.userId);
    return this.companyService.getCompanyById(id, true);
  }

  @Post('reorder')
  async reorderCompanies(@Body() body: { companyIds: string[] }) {
    return this.companyService.updateCompanyOrder(body.companyIds);
  }
}
