import { NotificationFactory } from '../notifications/notification-factory';
import { NotificationStats } from '../types/notification';
import { Product } from '../types/product';

async function simulateProductUpdates() {
  const notificationFactory = NotificationFactory.getInstance();

  // Get a verbose notification instance
  const notification = notificationFactory.getNotification('console', {
    level: 'verbose',
    colored: true,
  });

  // Example products
  const oldProduct: Product = {
    product_title: 'Dental Chair X1000',
    product_price: 1999.99,
    path_to_image: 'https://example.com/old-image.jpg',
    image_filename: 'old-image.jpg',
  };

  const newProduct: Product = {
    product_title: 'Dental Chair X1000',
    product_price: 1899.99,
    path_to_image: 'https://example.com/new-image.jpg',
    image_filename: 'new-image.jpg',
  };

  // Simulate scraping process
  notification.info('Starting product updates simulation...');

  // Show product update
  notification.productUpdate(oldProduct, newProduct);

  // Show a new product
  notification.productUpdate(null, {
    product_title: 'New Dental Light LED-500',
    product_price: 599.99,
    path_to_image: 'https://example.com/led-light.jpg',
    image_filename: 'led-light.jpg',
  });

  // Show some general notifications
  notification.success('Successfully processed product updates');
  notification.warning('Some images could not be downloaded');
  notification.error('Failed to process product: Invalid price format');

  // Show statistics
  const stats: NotificationStats = {
    totalProducts: 150,
    newProducts: 25,
    updatedProducts: 15,
    failedProducts: 3,
    scrapeDurationMs: 45000, // 45 seconds
    pagesScraped: 6,
    imagesDownloaded: 40,
  };

  notification.stats(stats);
}

// Run the example
simulateProductUpdates().catch((error) => {
  console.error('Example failed:', error);
  process.exit(1);
});
