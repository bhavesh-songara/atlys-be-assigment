export interface Product {
  product_title: string;
  product_price: number;
  image_url: string;
  path_to_image?: string;
  slug: string;
}

export interface ScraperConfig {
  url: string;
  proxy?: string;
  maxRetries?: number;
  retryDelay?: number;
  maxPages?: number;
  imageDownloadPath?: string;
}
