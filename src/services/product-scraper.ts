import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { Product, ScraperConfig } from '../types/product';
import { HttpClient } from '../utils/http-client';
import { StorageFactory } from '../storage/storage-factory';
import { Storage, ValidationError } from '../types/storage';

export class ProductScraper {
  private config: ScraperConfig;
  private httpClient: HttpClient;
  private storage: Storage;

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

    // Ensure image directory exists
    if (this.config.imageDownloadPath) {
      fs.mkdirSync(this.config.imageDownloadPath, { recursive: true });
    }
  }

  private getProducts(html: string): Product[] {
    const dom = new JSDOM(html);
    const products: Product[] = [];
    const document = dom.window.document;

    const productElements = document.querySelectorAll('ul.products li');

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
      return filename;
    } catch (error) {
      console.error(`Failed to download image from ${imageUrl}:`, error);
      return '';
    }
  }

  async scrapeProducts(): Promise<Product[]> {
    let currentUrl = this.config.url;
    let currentPage = 1;
    const allProducts: Product[] = [];

    while (currentUrl && currentPage <= (this.config.maxPages || 1)) {
      try {
        console.log(`Scraping page ${currentPage}: ${currentUrl}`);
        const html = await this.httpClient.get(currentUrl);

        const products = this.getProducts(html);

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
        currentUrl = this.getNextPageUrl(html) || '';
        currentPage++;

        // Add delay between pages
        if (currentUrl) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error scraping page ${currentPage}:`, error);
        break;
      }
    }

    return allProducts;
  }

  async run(): Promise<void> {
    try {
      const products = await this.scrapeProducts();

      // Save products using storage system
      await this.storage.save(products);

      console.log(`Scraped ${products.length} products. Results saved successfully.`);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        console.error('Validation errors:', error.errors);
      } else if (error instanceof Error) {
        console.error('Error running scraper:', error.message);
      } else {
        console.error('Unknown error occurred while running scraper');
      }
      throw error;
    }
  }
}
