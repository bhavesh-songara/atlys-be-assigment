import { Request, Response } from 'express';
import { ProductScraper } from '../services/product-scraper';
import { StorageFactory } from '../storage/storage-factory';
import { NotificationFactory } from '../notifications/notification-factory';
import { CacheFactory } from '../cache/cache-factory';
import dotenv from 'dotenv';

dotenv.config();

export class ScraperController {
  private static getCache() {
    const cacheFactory = CacheFactory.getInstance();
    return cacheFactory.getCache('redis', {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ttl: parseInt(process.env.REDIS_TTL || '3600'),
    });
  }

  static async startScraping(req: Request, res: Response) {
    try {
      const { url, maxPages = 1, proxy } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required',
        });
      }

      const scraper = new ProductScraper({
        url,
        maxPages,
        proxy,
        imageDownloadPath: './images',
      });

      // Get products from scraper
      await scraper.run();
      const storage = StorageFactory.getInstance().getStorage('json');
      const products = await storage.load();

      // Compare prices and update cache
      const cache = ScraperController.getCache();
      const priceChanges = await cache.compareAndUpdatePrices(products);

      // Get cache statistics
      const cacheStats = await cache.getStats();

      res.json({
        success: true,
        message: 'Scraping completed successfully',
        stats: {
          priceChanges,
          cache: cacheStats,
        },
      });
    } catch (error) {
      console.error('Scraping error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete scraping',
      });
    }
  }

  static async getProducts(req: Request, res: Response) {
    try {
      const storage = StorageFactory.getInstance().getStorage('json');
      const products = await storage.load();

      // Get cache statistics
      const cache = ScraperController.getCache();
      const cacheStats = await cache.getStats();

      res.json({
        success: true,
        data: products,
        cacheStats,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
      });
    }
  }

  static async clearProducts(req: Request, res: Response) {
    try {
      const storage = StorageFactory.getInstance().getStorage('json');
      await storage.clear();

      // Clear cache as well
      const cache = ScraperController.getCache();
      await cache.clear();

      res.json({
        success: true,
        message: 'Products and cache cleared successfully',
      });
    } catch (error) {
      console.error('Error clearing products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear products',
      });
    }
  }
}
