import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class WarEraApiService {
  private readonly logger = new Logger(WarEraApiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly rateLimitDelay: number;
  private readonly maxBatchSize: number;
  private lastRequestTime = 0;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get('WARERA_API_BASE_URL');
    this.apiKey = this.configService.get('WARERA_API_KEY');
    this.rateLimitDelay = parseInt(this.configService.get('API_RATE_LIMIT_DELAY_MS', '250'));
    this.maxBatchSize = parseInt(this.configService.get('API_MAX_BATCH_SIZE', '100'));
  }

  private async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  private getHeaders() {
    return {
      'X-API-Key': this.apiKey,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async request<T>(endpoint: string, params?: any, retries = 3): Promise<T> {
    await this.waitForRateLimit();

    try {
      // tRPC format: for batch=1, input should be {"0": params}
      const queryParams: any = params 
        ? { 
            batch: '1',
            input: JSON.stringify({ "0": params })
          }
        : { batch: '1' };

      const url = `${this.baseUrl}/${endpoint}`;
      this.logger.debug(`GET ${url} with params: ${JSON.stringify(queryParams)}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
          params: queryParams,
        })
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 429 && retries > 0) {
        const resetTime = error.response.headers['ratelimit-reset'];
        const waitTime = resetTime ? parseInt(resetTime) * 1000 : this.rateLimitDelay * 2;
        this.logger.warn(`Rate limited. Waiting ${waitTime}ms before retry. Retries left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.request(endpoint, params, retries - 1);
      }
      this.logger.error(`API request failed: ${endpoint}`, error);
      if (error instanceof AxiosError && error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async batchRequest<T>(endpoints: Array<{ endpoint: string; params?: any }>): Promise<T[]> {
    if (endpoints.length > this.maxBatchSize) {
      throw new Error(`Batch size ${endpoints.length} exceeds maximum ${this.maxBatchSize}`);
    }

    await this.waitForRateLimit();

    const batchEndpoint = endpoints.map(e => e.endpoint).join(',');
    const batchInput = endpoints.reduce((acc, e, idx) => {
      acc[idx.toString()] = e.params || {};
      return acc;
    }, {} as Record<string, any>);

    try {
      const url = `${this.baseUrl}/${batchEndpoint}`;
      this.logger.debug(`Batch GET ${url} with input: ${JSON.stringify(batchInput)}`);
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
          params: {
            batch: '1',
            input: JSON.stringify(batchInput),
          },
        })
      );
      
      this.logger.debug(`Batch response type: ${typeof response.data}, isArray: ${Array.isArray(response.data)}`);
      this.logger.debug(`Batch response keys: ${Object.keys(response.data || {}).join(', ')}`);
      
      return response.data;
    } catch (error) {
      this.logger.error('Batch request failed', error);
      if (error instanceof AxiosError && error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}
