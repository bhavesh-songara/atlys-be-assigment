import { Product } from '../types/product';
import { Storage, StorageValidationError, ValidationError } from '../types/storage';

export abstract class BaseStorage implements Storage {
  protected validateProduct(product: Product): StorageValidationError[] {
    const errors: StorageValidationError[] = [];

    if (!product.product_title) {
      errors.push({
        field: 'product_title',
        message: 'Product title is required',
      });
    }

    if (typeof product.product_price !== 'number' || product.product_price < 0) {
      errors.push({
        field: 'product_price',
        message: 'Product price must be a non-negative number',
      });
    }

    if (!product.image_url) {
      errors.push({
        field: 'image_url',
        message: 'Product image URL is required',
      });
    }

    if (!product.slug) {
      errors.push({
        field: 'slug',
        message: 'Product slug is required',
      });
    }

    return errors;
  }

  protected validateProducts(products: Product[]): void {
    const allErrors: StorageValidationError[] = [];

    products.forEach((product, index) => {
      const productErrors = this.validateProduct(product);
      if (productErrors.length > 0) {
        allErrors.push(
          ...productErrors.map((error) => ({
            ...error,
            field: `products[${index}].${error.field}`,
          }))
        );
      }
    });

    if (allErrors.length > 0) {
      throw new ValidationError(allErrors);
    }
  }

  abstract save(products: Product[]): Promise<void>;
  abstract load(): Promise<Product[]>;
  abstract clear(): Promise<void>;
}
