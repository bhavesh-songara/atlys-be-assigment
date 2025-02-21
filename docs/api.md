# API Documentation

## Authentication

All API endpoints require authentication using an API token. Include the token in the request header:

```http
x-api-key: your-api-token-here
```

## Endpoints

### Start Scraping

Initiates the scraping process for a given URL.

```http
POST /api/scrape
```

#### Request Body

| Field    | Type   | Required | Description                                       |
| -------- | ------ | -------- | ------------------------------------------------- |
| url      | string | Yes      | Target URL to scrape (must start with http(s)://) |
| maxPages | number | No       | Maximum pages to scrape (1-100, default: 1)       |
| proxy    | string | No       | Proxy URL for scraping                            |

#### Example Request

```json
{
  "url": "https://dentalstall.com/shop",
  "maxPages": 2,
  "proxy": "http://proxy-url:port"
}
```

#### Example Response

```json
{
  "success": true,
  "message": "Scraping completed successfully",
  "stats": {
    "priceChanges": [
      {
        "productTitle": "Example Product",
        "oldPrice": 99.99,
        "newPrice": 89.99,
        "changePercentage": -10.0
      }
    ],
    "cache": {
      "hits": 45,
      "misses": 5,
      "keys": 50
    }
  }
}
```

### Get Products

Retrieves scraped products with pagination and sorting options.

```http
GET /api/products
```

#### Query Parameters

| Parameter | Type   | Required | Description                                               |
| --------- | ------ | -------- | --------------------------------------------------------- |
| page      | number | No       | Page number (min: 1, default: 1)                          |
| limit     | number | No       | Items per page (1-100, default: 10)                       |
| sort      | string | No       | Sort order (price_asc, price_desc, title_asc, title_desc) |

#### Example Request

```http
GET /api/products?page=2&limit=20&sort=price_desc
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "product_title": "Example Product",
        "product_price": 99.99,
        "path_to_image": "https://example.com/image.jpg"
      }
    ],
    "total": 50,
    "page": 2,
    "totalPages": 3,
    "cacheStats": {
      "hits": 45,
      "misses": 5,
      "keys": 50
    }
  }
}
```

### Clear Products

Removes all scraped products and clears the cache.

```http
DELETE /api/products
```

#### Example Response

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

Common HTTP Status Codes:

- 200: Success
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid or missing API token)
- 500: Internal Server Error
