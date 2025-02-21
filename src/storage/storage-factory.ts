import { Storage, StorageConfig } from '../types/storage';
import { JsonStorage } from './json-storage';

export type StorageType = 'json';

export class StorageFactory {
  private static instance: StorageFactory;
  private storageInstances: Map<string, Storage>;

  private constructor() {
    this.storageInstances = new Map();
  }

  public static getInstance(): StorageFactory {
    if (!StorageFactory.instance) {
      StorageFactory.instance = new StorageFactory();
    }
    return StorageFactory.instance;
  }

  public getStorage(type: StorageType, config?: StorageConfig): Storage {
    const key = this.getStorageKey(type, config);

    if (!this.storageInstances.has(key)) {
      const storage = this.createStorage(type, config);
      this.storageInstances.set(key, storage);
    }

    return this.storageInstances.get(key)!;
  }

  private getStorageKey(type: StorageType, config?: StorageConfig): string {
    return `${type}:${config?.basePath || 'default'}`;
  }

  private createStorage(type: StorageType, config?: StorageConfig): Storage {
    switch (type) {
      case 'json':
        return new JsonStorage(config);
      default:
        throw new Error(`Unsupported storage type: ${type}`);
    }
  }
}
