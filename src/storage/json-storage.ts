import fs from 'fs/promises';
import path from 'path';
import { Product } from '../types/product';
import { StorageConfig } from '../types/storage';
import { BaseStorage } from './base-storage';

interface FileError extends Error {
  code?: string;
}

export class JsonStorage extends BaseStorage {
  private readonly filePath: string;
  private readonly pretty: boolean;

  constructor(config: StorageConfig = {}) {
    super();
    this.filePath = path.join(config.basePath || process.cwd(), 'products.json');
    this.pretty = config.pretty ?? true;
  }

  async save(products: Product[]): Promise<void> {
    try {
      // Validate products before saving
      this.validateProducts(products);

      // Ensure directory exists
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });

      // Write to file
      const data = this.pretty ? JSON.stringify(products, null, 2) : JSON.stringify(products);

      await fs.writeFile(this.filePath, data, 'utf8');
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'ValidationError') {
          throw error;
        }
        throw new Error(`Failed to save products: ${error.message}`);
      }
      throw new Error('Failed to save products: Unknown error');
    }
  }

  async load(): Promise<Product[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const products = JSON.parse(data) as Product[];

      // Validate loaded data
      this.validateProducts(products);

      return products;
    } catch (error: unknown) {
      if ((error as FileError).code === 'ENOENT') {
        return [];
      }
      if (error instanceof Error) {
        if (error.name === 'ValidationError') {
          throw error;
        }
        throw new Error(`Failed to load products: ${error.message}`);
      }
      throw new Error('Failed to load products: Unknown error');
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.filePath);
    } catch (error: unknown) {
      if ((error as FileError).code !== 'ENOENT') {
        if (error instanceof Error) {
          throw new Error(`Failed to clear products: ${error.message}`);
        }
        throw new Error('Failed to clear products: Unknown error');
      }
    }
  }
}
