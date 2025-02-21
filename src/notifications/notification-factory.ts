import { Notification, NotificationConfig } from '../types/notification';
import { ConsoleNotification } from './console-notification';

export type NotificationType = 'console';

export class NotificationFactory {
  private static instance: NotificationFactory;
  private notificationInstances: Map<string, Notification>;

  private constructor() {
    this.notificationInstances = new Map();
  }

  public static getInstance(): NotificationFactory {
    if (!NotificationFactory.instance) {
      NotificationFactory.instance = new NotificationFactory();
    }
    return NotificationFactory.instance;
  }

  public getNotification(type: NotificationType, config?: NotificationConfig): Notification {
    const key = this.getNotificationKey(type, config);

    if (!this.notificationInstances.has(key)) {
      const notification = this.createNotification(type, config);
      this.notificationInstances.set(key, notification);
    }

    return this.notificationInstances.get(key)!;
  }

  private getNotificationKey(type: NotificationType, config?: NotificationConfig): string {
    return `${type}:${config?.level || 'info'}:${config?.colored ? 'colored' : 'plain'}`;
  }

  private createNotification(type: NotificationType, config?: NotificationConfig): Notification {
    switch (type) {
      case 'console':
        return new ConsoleNotification(config);
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }
  }
}
