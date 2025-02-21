# Product Scraper API

A web scraper application for products with secure API endpoints.

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

## Development

To start the development server:

```bash
npm run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

All endpoints require authentication using the `x-api-key` header.

### POST /api/scrape

Start scraping products from a URL.

Request body:

```json
{
  "url": "https://example.com/products",
  "maxPages": 2,
  "proxy": "http://proxy-url:port" // optional
}
```

Response:

```json
{
  "success": true,
  "message": "Scraping completed successfully",
  "data": {
    "totalProducts": 50,
    "priceChanges": [
      {
        "productTitle": "Example Product",
        "oldPrice": 99.99,
        "newPrice": 89.99,
        "changePercentage": -10.0
      }
    ],
    "cacheStats": {
      "hits": 45,
      "misses": 5,
      "keys": 50
    }
  }
}
```

### GET /api/products

Get all scraped products with pagination and sorting.

Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort order
  - `price_asc`: Price ascending
  - `price_desc`: Price descending
  - `title_asc`: Title ascending
  - `title_desc`: Title descending

Response:

```json
{
  "success": true,
  "data": {
    "products": [...],
    "total": 50,
    "page": 1,
    "totalPages": 5,
    "cacheStats": {
      "hits": 45,
      "misses": 5,
      "keys": 50
    }
  }
}
```

### DELETE /api/products

Clear all scraped products and cache.

Response:

```json
{
  "success": true,
  "message": "Products and cache cleared successfully"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "errors": [
    {
      "field": "url",
      "message": "Must be a valid URL"
    }
  ]
}
```

## Authentication

The API uses token-based authentication. Include the token in your requests:

```bash
curl -H "x-api-key: your-secure-api-token-here" http://localhost:3000/api/products
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server
- `npm run build` - Build the project
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run scrape` - Run the scraper directly
- `npm run storage-example` - Run storage system example
- `npm run notification-example` - Run notification system example
- `npm run cache-example` - Run cache system example

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
│   ├── app.ts         # Express app setup
│   └── server.ts      # Server entry point
├── dist/              # Compiled output
└── package.json
```

## Postman Collection

Import the `postman_collection.json` file into Postman to test the API endpoints. Make sure to set up the environment variables:

- `base_url`: Your API base URL (e.g., `http://localhost:3000`)
- `api_token`: Your API token from the `.env` file

## License

ISC
