import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { Product, ScraperConfig } from '../types/product';
import { HttpClient } from '../utils/http-client';
import { StorageFactory } from '../storage/storage-factory';
import { Storage, ValidationError } from '../types/storage';
import { NotificationFactory } from '../notifications/notification-factory';
import { Notification, NotificationStats } from '../types/notification';
import { CacheFactory } from '../cache/cache-factory';
import { Cache } from '../types/cache';

export class ProductScraper {
  private config: ScraperConfig;
  private httpClient: HttpClient;
  private storage: Storage;
  private notification: Notification;
  private cache!: Cache;
  private stats: NotificationStats;
  private startTime: number;

  constructor(config: ScraperConfig) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      maxPages: 1,
      imageDownloadPath: './images',
      ...config,
    };

    this.httpClient = new HttpClient(
      this.config.proxy,
      this.config.maxRetries,
      this.config.retryDelay
    );

    // Initialize storage
    const storageFactory = StorageFactory.getInstance();
    this.storage = storageFactory.getStorage('json', {
      basePath: process.cwd(),
      pretty: true,
    });

    // Initialize notification
    const notificationFactory = NotificationFactory.getInstance();
    this.notification = notificationFactory.getNotification('console', {
      level: 'verbose',
      colored: true,
    });

    // Initialize statistics
    this.stats = {
      totalProducts: 0,
      newProducts: 0,
      updatedProducts: 0,
      failedProducts: 0,
      scrapeDurationMs: 0,
      pagesScraped: 0,
      imagesDownloaded: 0,
    };

    this.startTime = Date.now();

    // Ensure image directory exists
    if (this.config.imageDownloadPath) {
      fs.mkdirSync(this.config.imageDownloadPath, { recursive: true });
    }
  }

  private async initializeCache(): Promise<void> {
    const cacheFactory = CacheFactory.getInstance();
    this.cache = await cacheFactory.getCache('redis', {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ttl: parseInt(process.env.REDIS_TTL || '3600'),
    });
    await this.cache.init();
  }

  private getSlugFromUrl(url: string): string {
    // Remove trailing slash if exists
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    // Get the last part of the URL
    const parts = cleanUrl.split('/');
    return parts[parts.length - 1];
  }

  private getProducts(html: string): Product[] {
    const dom = new JSDOM(html);
    const products: Product[] = [];
    const document = dom.window.document;

    const productElements = document.querySelectorAll('ul.products .product');

    productElements.forEach((productElement) => {
      const titleElement = productElement.querySelector('.addtocart-buynow-btn a');
      const title = titleElement?.getAttribute('data-title') || '';

      const priceElement = productElement.querySelector('.woocommerce-Price-amount bdi');
      const price = priceElement?.textContent?.replace(/[^\d.]/g, '') || '0';

      const imageElement = productElement.querySelector('.mf-product-thumbnail a noscript img');
      const imagePath = imageElement?.getAttribute('src') || '';

      const productUrlElement = productElement.querySelector('.mf-product-thumbnail a');
      const productUrl = productUrlElement?.getAttribute('href') || '';
      const slug = this.getSlugFromUrl(productUrl);

      products.push({
        product_title: title,
        product_price: parseFloat(price),
        image_url: imagePath,
        path_to_image: imagePath,
        slug: slug,
      });
    });

    return products;
  }

  private getNextPageUrl(html: string): string | null {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const nextPageLink = document.querySelector('.next.page-numbers');
    return nextPageLink?.getAttribute('href') || null;
  }

  private generateImageFilename(imageUrl: string, slug: string): string {
    const extension = path.extname(imageUrl);
    return `${slug}${extension}`;
  }

  private async downloadImage(imageUrl: string, slug: string): Promise<string> {
    try {
      const filename = this.generateImageFilename(imageUrl, slug);
      const filepath = path.join(this.config.imageDownloadPath!, filename);
      const fullPath = path.resolve(filepath);

      // Check if the image already exists
      if (fs.existsSync(filepath)) {
        return fullPath;
      }

      const buffer = await this.httpClient.downloadFile(imageUrl);
      fs.writeFileSync(filepath, buffer);
      this.stats.imagesDownloaded++;
      return fullPath;
    } catch (error) {
      this.notification.error(`Failed to download image from ${imageUrl}`);
      return '';
    }
  }

  private async compareWithExisting(newProducts: Product[]): Promise<void> {
    try {
      for (const newProduct of newProducts) {
        const existingProductPrice = await this.cache.get<number>(newProduct.slug);

        if (!existingProductPrice) {
          this.stats.newProducts++;
          await this.cache.set(newProduct.slug, newProduct.product_price);
        } else if (existingProductPrice !== newProduct.product_price) {
          this.stats.updatedProducts++;
          await this.cache.set(newProduct.slug, newProduct.product_price);
          this.notification.productUpdate(
            {
              product_title: newProduct.product_title,
              product_price: existingProductPrice,
              image_url: newProduct.image_url,
              path_to_image: newProduct.path_to_image,
              slug: newProduct.slug,
            },
            {
              product_title: newProduct.product_title,
              product_price: newProduct.product_price,
              image_url: newProduct.image_url,
              path_to_image: newProduct.path_to_image,
              slug: newProduct.slug,
            }
          );
        }
      }
    } catch (error) {
      this.notification.warning('Could not compare with existing products in Redis');
    }
  }

  async scrapeProducts(): Promise<Product[]> {
    let currentUrl = this.config.url;
    let currentPage = 1;
    const allProducts: Product[] = [];

    while (currentUrl && currentPage <= (this.config.maxPages || 1)) {
      let pageHtml = '';
      try {
        this.notification.info(`Scraping page ${currentPage}: ${currentUrl}`);
        pageHtml = await this.httpClient.get(currentUrl);

        const products = this.getProducts(pageHtml);
        this.stats.pagesScraped++;

        // Download images if path is specified
        if (this.config.imageDownloadPath) {
          for (const product of products) {
            if (product.image_url) {
              product.path_to_image = await this.downloadImage(product.image_url, product.slug);
            }
          }
        }

        allProducts.push(...products);

        // Get next page URL
        currentUrl = this.getNextPageUrl(pageHtml) || '';
        currentPage++;

        // Add delay between pages
        if (currentUrl) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        this.notification.error(`Error scraping page ${currentPage}`);
        this.stats.failedProducts += this.getProducts(pageHtml).length;
        break;
      }
    }

    return allProducts;
  }

  async run(): Promise<void> {
    try {
      // Initialize Redis cache
      await this.initializeCache();

      const products = await this.scrapeProducts();
      this.stats.totalProducts = products.length;

      // Compare with existing products using Redis
      await this.compareWithExisting(products);

      // Load existing products
      const existingProducts = await this.storage.load();

      // Create a map of existing products by slug for quick lookup
      const existingProductMap = new Map(existingProducts.map((p) => [p.slug, p]));

      // Update only the products we've scraped, keep others unchanged
      products.forEach((product) => {
        existingProductMap.set(product.slug, product);
      });

      // Convert map back to array and save
      const updatedProducts = Array.from(existingProductMap.values());
      await this.storage.save(updatedProducts);

      // Calculate final statistics
      this.stats.scrapeDurationMs = Date.now() - this.startTime;

      // Show final statistics
      this.notification.stats(this.stats);
      this.notification.success(`Scraped ${products.length} products successfully`);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        this.notification.error('Validation errors occurred');
        error.errors.forEach((e) => this.notification.error(`${e.field}: ${e.message}`));
      } else if (error instanceof Error) {
        this.notification.error(`Scraping failed: ${error.message}`);
      } else {
        this.notification.error('An unknown error occurred while scraping');
      }
      throw error;
    }
  }
}
