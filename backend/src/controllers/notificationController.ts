import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const limit = parseInt((req.query.limit as string) || '50', 10);
    const unreadOnly = req.query.unreadOnly === 'true';

    const query: Record<string, any> = { user: req.userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error: any) {
    console.error('[getNotifications] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const count = await Notification.countDocuments({
      user: req.userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error('[getUnreadCount] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error('[markNotificationAsRead] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    await Notification.updateMany(
      { user: req.userId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    console.error('[markAllNotificationsAsRead] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error: any) {
    console.error('[deleteNotification] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
