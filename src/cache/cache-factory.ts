import { Cache, CacheConfig } from '../types/cache';
import { RedisCache } from './redis-cache';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export type CacheType = 'redis';

export class CacheFactory {
  private static instance: CacheFactory;
  private cacheInstances: Map<string, Cache>;
  private redisClient: RedisClientType | null = null;

  private constructor() {
    this.cacheInstances = new Map();
  }

  public static getInstance(): CacheFactory {
    if (!CacheFactory.instance) {
      CacheFactory.instance = new CacheFactory();
    }
    return CacheFactory.instance;
  }

  public async connectToRedis(): Promise<RedisClientType> {
    if (!this.redisClient) {
      console.log(`Connecting to redis ${process.env.REDIS_HOST}`);

      this.redisClient = createClient({
        socket: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        },
        password: process.env.REDIS_PASSWORD,
      });

      this.redisClient.on('connect', () => {
        console.log('Connected to redis');
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis connection error:', err);
        this.redisClient?.disconnect();
        this.redisClient = null;
      });

      // Connect to redis
      await this.redisClient.connect();

      // Check if redis is connected
      try {
        await this.redisClient.ping();
      } catch (err) {
        await this.redisClient.disconnect();
        this.redisClient = null;
        throw new Error('Error in connecting to redis');
      }
    }

    return this.redisClient;
  }

  public getRedisClient(): RedisClientType {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized. Call connectToRedis() first.');
    }
    return this.redisClient;
  }

  public async getCache(type: CacheType, config?: CacheConfig): Promise<Cache> {
    const key = this.getCacheKey(type, config);

    if (!this.cacheInstances.has(key)) {
      const cache = await this.createCache(type, config);
      this.cacheInstances.set(key, cache);
      // Initialize cache
      await cache.init().catch((err) => console.error(`Failed to initialize ${type} cache:`, err));
    }

    return this.cacheInstances.get(key)!;
  }

  private getCacheKey(type: CacheType, config?: CacheConfig): string {
    return `${type}:${config?.host || 'localhost'}:${config?.port || 6379}`;
  }

  private async createCache(type: CacheType, config?: CacheConfig): Promise<Cache> {
    switch (type) {
      case 'redis':
        await this.connectToRedis();
        return new RedisCache(config);
      default:
        throw new Error(`Unsupported cache type: ${type}`);
    }
  }
}
