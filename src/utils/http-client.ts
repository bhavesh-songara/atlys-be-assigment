import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

export class HttpClient {
  private client: AxiosInstance;
  private retries: number;
  private retryDelay: number;

  constructor(proxy?: string, maxRetries: number = 3, retryDelay: number = 1000) {
    this.retries = maxRetries;
    this.retryDelay = retryDelay;

    const config: any = {
      timeout: 30000,
    };

    if (proxy) {
      config.httpsAgent = new HttpsProxyAgent(proxy);
      config.proxy = false; // Disable axios proxy handling
    }

    this.client = axios.create(config);

    // Add retry interceptor
    this.client.interceptors.response.use(null, async (error) => {
      const { config } = error;
      if (!config) return Promise.reject(error);

      config.retryCount = config.retryCount || 0;

      const shouldRetry = this.shouldRetry(error) && config.retryCount < this.retries;

      if (!shouldRetry) {
        return Promise.reject(error);
      }

      config.retryCount += 1;

      const delay = this.retryDelay * config.retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));

      return this.client(config);
    });
  }

  private shouldRetry(error: any): boolean {
    if (!error.response) return true; // Network errors should be retried

    const status = error.response.status;
    return (
      status === 408 || // Request Timeout
      status === 429 || // Too Many Requests
      (status >= 500 && status <= 599) // Server errors
    );
  }

  async get(url: string): Promise<string> {
    try {
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${url} after ${this.retries} retries:`, error);
      throw error;
    }
  }

  async downloadFile(url: string): Promise<Buffer> {
    try {
      const response = await this.client.get(url, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      console.error(`Failed to download file from ${url}:`, error);
      throw error;
    }
  }
}
