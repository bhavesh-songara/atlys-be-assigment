import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export let redisClient: IORedis;

export const connectToRedis = async () => {
  console.log(`Connecting to redis ${process.env.REDIS_HOST}`);

  if (!redisClient) {
    redisClient = new IORedis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      // tls: process.env.REDIS_TLS_DISABLED ? undefined : {}
    });

    redisClient.on('connect', () => {
      console.log('Connected to redis');
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
      redisClient.disconnect();
    });
  }

  // Check if redis is connected
  try {
    await redisClient.ping();
  } catch (err) {
    redisClient.disconnect();
    throw new Error('Error in connecting to redis');
  }

  return redisClient;
};

export const getRedisClient = () => {
  return redisClient;
};
