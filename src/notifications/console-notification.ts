import { NotificationConfig, NotificationStats } from '../types/notification';
import { Product } from '../types/product';
import { BaseNotification } from './base-notification';

const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

export class ConsoleNotification extends BaseNotification {
  constructor(config: NotificationConfig = {}) {
    super(config);
  }

  private colorize(color: keyof typeof Colors, text: string): string {
    if (!this.config.colored) return text;
    return `${Colors[color]}${text}${Colors.reset}`;
  }

  info(message: string): void {
    console.log(this.colorize('blue', 'ℹ'), message);
  }

  success(message: string): void {
    console.log(this.colorize('green', '✓'), message);
  }

  warning(message: string): void {
    console.log(this.colorize('yellow', '⚠'), message);
  }

  error(message: string): void {
    console.error(this.colorize('red', '✖'), message);
  }

  stats(stats: NotificationStats): void {
    console.log('\n' + this.colorize('cyan', '📊 Scraping Statistics:'));
    console.log('━'.repeat(50));
    console.log(
      `Duration: ${this.colorize('bright', this.formatDuration(stats.scrapeDurationMs))}`
    );
    console.log(`Pages Scraped: ${this.colorize('bright', stats.pagesScraped.toString())}`);
    console.log(`Total Products: ${this.colorize('bright', stats.totalProducts.toString())}`);
    console.log(`New Products: ${this.colorize('green', stats.newProducts.toString())}`);
    console.log(`Updated Products: ${this.colorize('yellow', stats.updatedProducts.toString())}`);
    console.log(`Failed Products: ${this.colorize('red', stats.failedProducts.toString())}`);
    console.log(
      `Images Downloaded: ${this.colorize('magenta', stats.imagesDownloaded.toString())}`
    );
    console.log('━'.repeat(50) + '\n');
  }

  productUpdate(oldProduct: Product | null, newProduct: Product): void {
    if (this.config.level !== 'verbose') return;

    const changes = this.compareProducts(oldProduct, newProduct);
    if (changes.length === 0) return;

    console.log(this.colorize('cyan', '🔄'), this.colorize('bright', newProduct.product_title));

    changes.forEach((change) => {
      console.log('  ' + this.colorize('dim', '•'), change);
    });
  }
}
