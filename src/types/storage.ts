import { Product } from './product';

export interface StorageConfig {
  basePath?: string;
  pretty?: boolean;
}

export interface Storage {
  save(products: Product[]): Promise<void>;
  load(): Promise<Product[]>;
  clear(): Promise<void>;
}

export interface StorageValidationError {
  field: string;
  message: string;
}

export class ValidationError extends Error {
  constructor(public errors: StorageValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}
