import { Request, Response } from 'express';
import { ProductScraper } from '../services/product-scraper';
import { StorageFactory } from '../storage/storage-factory';
import { NotificationFactory } from '../notifications/notification-factory';

export class ScraperController {
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

      await scraper.run();

      res.json({
        success: true,
        message: 'Scraping completed successfully',
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

      res.json({
        success: true,
        data: products,
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

      res.json({
        success: true,
        message: 'Products cleared successfully',
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
