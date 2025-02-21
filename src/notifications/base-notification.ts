import { Notification, NotificationConfig, NotificationStats } from '../types/notification';
import { Product } from '../types/product';

export abstract class BaseNotification implements Notification {
  protected config: NotificationConfig;

  constructor(config: NotificationConfig = {}) {
    this.config = {
      level: 'info',
      colored: true,
      ...config,
    };
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  }

  protected formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  protected compareProducts(oldProduct: Product | null, newProduct: Product): string[] {
    const changes: string[] = [];

    if (!oldProduct) {
      return ['New product added'];
    }

    if (oldProduct.product_price !== newProduct.product_price) {
      const oldPrice = this.formatPrice(oldProduct.product_price);
      const newPrice = this.formatPrice(newProduct.product_price);
      changes.push(`Price changed from ${oldPrice} to ${newPrice}`);
    }

    if (oldProduct.product_title !== newProduct.product_title) {
      changes.push('Title updated');
    }

    if (oldProduct.path_to_image !== newProduct.path_to_image) {
      changes.push('Image updated');
    }

    return changes;
  }

  abstract info(message: string): void;
  abstract success(message: string): void;
  abstract warning(message: string): void;
  abstract error(message: string): void;
  abstract stats(stats: NotificationStats): void;
  abstract productUpdate(oldProduct: Product | null, newProduct: Product): void;
}
