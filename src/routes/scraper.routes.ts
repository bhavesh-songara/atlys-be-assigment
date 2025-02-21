import { Router } from 'express';
import { ScraperController } from '../controllers/scraper.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.post('/scrape', authMiddleware, ScraperController.startScraping);
router.get('/products', authMiddleware, ScraperController.getProducts);
router.delete('/products', authMiddleware, ScraperController.clearProducts);

export default router;
