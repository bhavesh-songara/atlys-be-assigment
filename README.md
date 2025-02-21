# Product Scraper API

A robust web scraper application for products with secure API endpoints, caching, and notifications.

## Features

- 🔒 Secure API endpoints with token authentication
- 📦 JSON file storage for scraped products
- 💾 Redis caching with price change detection
- 🖼️ Automatic image downloading
- 📊 Detailed scraping statistics
- 🔄 Proxy support for scraping
- 📝 Comprehensive logging and notifications

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Redis (v6 or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   API_TOKEN=your-secure-api-token-here
   PORT=3000

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_TTL=3600
   ```

## Quick Start

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Run the scraper example:

   ```bash
   npm run scrape
   ```

3. Try other examples:

   ```bash
   npm run storage-example     # Storage system demo
   npm run notification-example # Notification system demo
   npm run cache-example      # Cache system demo
   ```

## Project Structure

```
.
├── src/
│   ├── controllers/    # API controllers
│   ├── middleware/     # Express middleware
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── storage/       # Storage implementations
│   ├── cache/         # Cache implementations
│   ├── notifications/ # Notification system
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── examples/      # Example scripts
│   ├── app.ts         # Express app setup
│   └── server.ts      # Server entry point
├── docs/             # Documentation
│   ├── api.md        # API documentation
│   └── configuration.md # Configuration guide
└── package.json
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server
- `npm run build` - Build the project
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run scrape` - Run the scraper directly
- `npm run storage-example` - Run storage system example
- `npm run notification-example` - Run notification system example
- `npm run cache-example` - Run cache system example

## Documentation

- [API Documentation](docs/api.md)
- [Configuration Guide](docs/configuration.md)

## Example Usage

### Using the API

1. Start scraping products:

   ```bash
   curl -X POST http://localhost:3000/api/scrape \
     -H "x-api-key: your-api-token" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com/products", "maxPages": 2}'
   ```

2. Get scraped products:

   ```bash
   curl http://localhost:3000/api/products \
     -H "x-api-key: your-api-token"
   ```

3. Clear all products:

   ```bash
   curl -X DELETE http://localhost:3000/api/products \
     -H "x-api-key: your-api-token"
   ```

### Using the Scraper Programmatically

```typescript
import { ProductScraper } from './services/product-scraper';

const scraper = new ProductScraper({
  url: 'https://example.com/products',
  maxPages: 2,
  imageDownloadPath: './images',
});

await scraper.run();
```

## Error Handling

The application includes comprehensive error handling:

- Input validation
- Authentication checks
- Rate limiting
- Retry mechanisms for failed requests
- Detailed error responses
