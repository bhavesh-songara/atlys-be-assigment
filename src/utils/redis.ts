import IORedis from 'ioredis';
import { CacheFactory } from '../cache/cache-factory';

export let redisClient: IORedis;

export const connectToRedis = async () => {
  const cacheFactory = CacheFactory.getInstance();
  redisClient = await cacheFactory.connectToRedis();
  return redisClient;
};

export const getRedisClient = () => {
  const cacheFactory = CacheFactory.getInstance();
  return cacheFactory.getRedisClient();
};
