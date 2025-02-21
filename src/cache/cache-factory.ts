import { Cache, CacheConfig } from '../types/cache';
import { RedisCache } from './redis-cache';

export type CacheType = 'redis';

export class CacheFactory {
  private static instance: CacheFactory;
  private cacheInstances: Map<string, Cache>;

  private constructor() {
    this.cacheInstances = new Map();
  }

  public static getInstance(): CacheFactory {
    if (!CacheFactory.instance) {
      CacheFactory.instance = new CacheFactory();
    }
    return CacheFactory.instance;
  }

  public getCache(type: CacheType, config?: CacheConfig): Cache {
    const key = this.getCacheKey(type, config);

    if (!this.cacheInstances.has(key)) {
      const cache = this.createCache(type, config);
      this.cacheInstances.set(key, cache);
      // Initialize cache
      cache.init().catch((err) => console.error(`Failed to initialize ${type} cache:`, err));
    }

    return this.cacheInstances.get(key)!;
  }

  private getCacheKey(type: CacheType, config?: CacheConfig): string {
    return `${type}:${config?.host || 'localhost'}:${config?.port || 6379}`;
  }

  private createCache(type: CacheType, config?: CacheConfig): Cache {
    switch (type) {
      case 'redis':
        return new RedisCache(config);
      default:
        throw new Error(`Unsupported cache type: ${type}`);
    }
  }
}
