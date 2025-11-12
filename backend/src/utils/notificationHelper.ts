import Notification from '../models/Notification';

interface CreateNotificationParams {
  user: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const createNotification = async ({
  user,
  type,
  title,
  message,
  actionUrl,
  metadata,
}: CreateNotificationParams): Promise<void> => {
  try {
    await Notification.create({
      user,
      type,
      title,
      message,
      actionUrl,
      metadata,
    });
  } catch (error) {
    console.error('[createNotification] Error creating notification:', error);
  }
};
