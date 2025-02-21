import { Product } from './product';

export interface NotificationStats {
  totalProducts: number;
  newProducts: number;
  updatedProducts: number;
  failedProducts: number;
  scrapeDurationMs: number;
  pagesScraped: number;
  imagesDownloaded: number;
}

export interface NotificationConfig {
  level?: 'info' | 'verbose';
  colored?: boolean;
}

export interface Notification {
  info(message: string): void;
  success(message: string): void;
  warning(message: string): void;
  error(message: string): void;
  stats(stats: NotificationStats): void;
  productUpdate(oldProduct: Product | null, newProduct: Product): void;
}
