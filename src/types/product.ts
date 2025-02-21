export interface Product {
  product_title: string;
  product_price: number;
  path_to_image: string;
  image_filename?: string;
}

export interface ScraperConfig {
  url: string;
  proxy?: string;
  maxRetries?: number;
  retryDelay?: number;
  maxPages?: number;
  imageDownloadPath?: string;
}
