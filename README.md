# Product Scraper API

A web scraper application for products with secure API endpoints.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

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

### GET /api/products

Get all scraped products.

### DELETE /api/products

Clear all scraped products.

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

## Project Structure

```
.
├── src/
│   ├── controllers/    # API controllers
│   ├── middleware/     # Express middleware
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── storage/       # Storage implementations
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
