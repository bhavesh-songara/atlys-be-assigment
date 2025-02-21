import { Product } from './product';

export interface CacheConfig {
  host?: string;
  port?: number;
  password?: string;
  ttl?: number; // Time to live in seconds
}

export interface PriceChange {
  productTitle: string;
  oldPrice: number;
  newPrice: number;
  changePercentage: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
}

export interface Cache {
  init(): Promise<void>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
  compareAndUpdatePrices(products: Product[]): Promise<PriceChange[]>;
}
