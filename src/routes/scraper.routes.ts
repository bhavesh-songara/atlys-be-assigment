import { Router } from 'express';
import { ScraperController } from '../controllers/scraper.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  validateScrapeRequest,
  validateProductsRequest,
} from '../middleware/validation.middleware';

const router = Router();

// Protected routes with validation
router.post('/scrape', authMiddleware, validateScrapeRequest, ScraperController.startScraping);
router.get('/products', authMiddleware, validateProductsRequest, ScraperController.getProducts);
router.delete('/products', authMiddleware, ScraperController.clearProducts);

export default router;
