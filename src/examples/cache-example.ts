import { CacheFactory } from '../cache/cache-factory';
import { Product } from '../types/product';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    // Initialize cache
    const cacheFactory = CacheFactory.getInstance();
    const cache = cacheFactory.getCache('redis', {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ttl: parseInt(process.env.REDIS_TTL || '3600'),
    });

    // Example products with initial prices
    const initialProducts: Product[] = [
      {
        product_title: 'Dental Chair X1000',
        product_price: 1999.99,
        path_to_image: 'https://example.com/chair1.jpg',
      },
      {
        product_title: 'Dental Light LED-500',
        product_price: 599.99,
        path_to_image: 'https://example.com/light1.jpg',
      },
    ];

    console.log('Saving initial products to cache...');
    const initialChanges = await cache.compareAndUpdatePrices(initialProducts);
    console.log('Initial price changes:', initialChanges);

    // Simulate price changes
    const updatedProducts: Product[] = [
      {
        product_title: 'Dental Chair X1000',
        product_price: 1899.99, // Price decreased
        path_to_image: 'https://example.com/chair1.jpg',
      },
      {
        product_title: 'Dental Light LED-500',
        product_price: 649.99, // Price increased
        path_to_image: 'https://example.com/light1.jpg',
      },
      {
        product_title: 'New Product',
        product_price: 299.99, // New product
        path_to_image: 'https://example.com/new1.jpg',
      },
    ];

    console.log('\nChecking price changes...');
    const priceChanges = await cache.compareAndUpdatePrices(updatedProducts);

    console.log('\nPrice changes detected:');
    priceChanges.forEach((change) => {
      const direction = change.changePercentage > 0 ? 'increased' : 'decreased';
      console.log(
        `${change.productTitle}: ${direction} by ${Math.abs(change.changePercentage).toFixed(2)}%`,
        `(${change.oldPrice} -> ${change.newPrice})`
      );
    });

    // Show cache statistics
    const stats = await cache.getStats();
    console.log('\nCache statistics:', stats);

    // Clean up
    console.log('\nClearing cache...');
    await cache.clear();
    console.log('Cache cleared successfully');
  } catch (error) {
    console.error('Error in cache example:', error);
    process.exit(1);
  }
}

main();
