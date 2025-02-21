import { StorageFactory } from '../storage/storage-factory';
import { Product } from '../types/product';

async function main() {
  // Get storage instance
  const storageFactory = StorageFactory.getInstance();
  const storage = storageFactory.getStorage('json', {
    basePath: './data',
    pretty: true,
  });

  // Example products
  const products: Product[] = [
    {
      product_title: 'Test Product 1',
      product_price: 99.99,
      image_url: 'https://example.com/image1.jpg',
      path_to_image: 'https://example.com/image1.jpg',
      slug: 'test-product-1',
    },
    {
      product_title: 'Test Product 2',
      product_price: 149.99,
      image_url: 'https://example.com/image2.jpg',
      path_to_image: 'https://example.com/image2.jpg',
      slug: 'test-product-2',
    },
  ];

  try {
    // Save products
    console.log('Saving products...');
    await storage.save(products);
    console.log('Products saved successfully!');

    // Load products
    console.log('\nLoading products...');
    const loadedProducts = await storage.load();
    console.log('Loaded products:', JSON.stringify(loadedProducts, null, 2));

    // Clear storage
    console.log('\nClearing storage...');
    await storage.clear();
    console.log('Storage cleared successfully!');

    // Verify storage is empty
    const emptyProducts = await storage.load();
    console.log('\nVerifying storage is empty:', emptyProducts);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

main();
