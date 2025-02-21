import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import scraperRoutes from './routes/scraper.routes';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', scraperRoutes);

// Basic route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Product Scraper API' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
  });
});

export default app;
