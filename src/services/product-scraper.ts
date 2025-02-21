import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { Product, ScraperConfig } from '../types/product';
import { HttpClient } from '../utils/http-client';
import { StorageFactory } from '../storage/storage-factory';
import { Storage, ValidationError } from '../types/storage';
import { NotificationFactory } from '../notifications/notification-factory';
import { Notification, NotificationStats } from '../types/notification';

export class ProductScraper {
  private config: ScraperConfig;
  private httpClient: HttpClient;
  private storage: Storage;
  private notification: Notification;
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

      products.push({
        product_title: title,
        product_price: parseFloat(price),
        path_to_image: imagePath,
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

  private async downloadImage(imageUrl: string): Promise<string> {
    try {
      const buffer = await this.httpClient.downloadFile(imageUrl);
      const filename = `${Date.now()}-${path.basename(imageUrl)}`;
      const filepath = path.join(this.config.imageDownloadPath!, filename);

      fs.writeFileSync(filepath, buffer);
      this.stats.imagesDownloaded++;
      return filename;
    } catch (error) {
      this.notification.error(`Failed to download image from ${imageUrl}`);
      return '';
    }
  }

  private async compareWithExisting(newProducts: Product[]): Promise<void> {
    try {
      const existingProducts = await this.storage.load();
      const existingProductMap = new Map(existingProducts.map((p) => [p.product_title, p]));

      for (const newProduct of newProducts) {
        const existingProduct = existingProductMap.get(newProduct.product_title) || null;
        if (!existingProduct) {
          this.stats.newProducts++;
        } else if (
          existingProduct.product_price !== newProduct.product_price ||
          existingProduct.path_to_image !== newProduct.path_to_image
        ) {
          this.stats.updatedProducts++;
        }
        this.notification.productUpdate(existingProduct, newProduct);
      }
    } catch (error) {
      this.notification.warning('Could not compare with existing products');
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
            if (product.path_to_image) {
              product.image_filename = await this.downloadImage(product.path_to_image);
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
      const products = await this.scrapeProducts();
      this.stats.totalProducts = products.length;

      // Compare with existing products
      await this.compareWithExisting(products);

      // Save products using storage system
      await this.storage.save(products);

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
