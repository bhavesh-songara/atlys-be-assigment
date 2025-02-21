import IORedis from 'ioredis';
import { Cache, CacheConfig, CacheStats, PriceChange } from '../types/cache';
import { Product } from '../types/product';
import { getRedisClient } from '../utils/redis';

export class RedisCache implements Cache {
  private client: IORedis;
  private stats: CacheStats;
  private readonly defaultTTL: number;

  constructor(config: CacheConfig = {}) {
    const { ttl = 3600 } = config;
    this.client = getRedisClient();
    this.defaultTTL = ttl;
    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
    };
  }

  async init(): Promise<void> {
    // No need to connect here as we're using the shared Redis client
    // that is already connected in server startup
    return;
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await this.client.setex(key, ttl, serializedValue);
    this.stats.keys++;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);

    if (value) {
      this.stats.hits++;
      return JSON.parse(value) as T;
    }

    this.stats.misses++;
    return null;
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
    this.stats.keys = Math.max(0, this.stats.keys - 1);
  }

  async clear(): Promise<void> {
    await this.client.flushall();
    this.stats.keys = 0;
  }

  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  async compareAndUpdatePrices(products: Product[]): Promise<PriceChange[]> {
    const changes: PriceChange[] = [];
    const priceKey = 'product_prices';

    // Get cached prices
    const cachedPricesStr = await this.get<Record<string, number>>(priceKey);
    const cachedPrices = cachedPricesStr || {};

    // Compare and collect changes
    for (const product of products) {
      const oldPrice = cachedPrices[product.product_title];

      if (oldPrice !== undefined && oldPrice !== product.product_price) {
        const changePercentage = ((product.product_price - oldPrice) / oldPrice) * 100;

        changes.push({
          productTitle: product.product_title,
          oldPrice,
          newPrice: product.product_price,
          changePercentage,
        });
      }

      // Update cached price
      cachedPrices[product.product_title] = product.product_price;
    }

    // Save updated prices
    await this.set(priceKey, cachedPrices);

    return changes;
  }
}
