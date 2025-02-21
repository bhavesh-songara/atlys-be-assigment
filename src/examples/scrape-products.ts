import { ProductScraper } from '../services/product-scraper';

async function main() {
  const scraper = new ProductScraper({
    url: 'https://dentalstall.com/shop',
    maxPages: 1, // Start with 1 page for testing
    maxRetries: 3,
    retryDelay: 1000,
    imageDownloadPath: './images',
    // Uncomment to use proxy
    // proxy: 'http://your-proxy-url:port',
  });

  try {
    await scraper.run();
    console.log('Scraping completed successfully!');
  } catch (error) {
    console.error('Error running scraper:', error);
    process.exit(1);
  }
}

main();
