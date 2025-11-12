import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  Loader2Icon,
  UserPlusIcon,
  MessageSquareIcon,
  UsersIcon,
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import type { Notification as ApiNotification } from '../../types/api';

type NotificationType =
  | 'project_invite'
  | 'message'
  | 'team_join'
  | 'project_update'
  | 'request_approved'
  | 'request_declined'
  | string;

interface NotificationItem extends ApiNotification {
  type: NotificationType;
  metadata?: {
    projectId?: string;
    senderId?: string;
    senderName?: string;
    senderAvatar?: string;
  };
}

interface NotificationGroup {
  date: string;
  notifications: NotificationItem[];
}

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationRead: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  onNotificationRead,
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getNotifications({
        limit: 50,
        unreadOnly: filter === 'unread',
      });

      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      const message =
        err.response?.data?.message || err.message || 'Failed to load notifications.';
      setError(message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    onClose();
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = 'h-5 w-5';
    switch (type) {
      case 'project_invite':
        return <UserPlusIcon className={`${iconClass} text-orange-600`} />;
      case 'message':
        return <MessageSquareIcon className={`${iconClass} text-blue-600`} />;
      case 'team_join':
        return <UsersIcon className={`${iconClass} text-green-600`} />;
      case 'project_update':
        return <FolderIcon className={`${iconClass} text-purple-600`} />;
      case 'request_approved':
        return <CheckCircleIcon className={`${iconClass} text-green-600`} />;
      case 'request_declined':
        return <XCircleIcon className={`${iconClass} text-red-600`} />;
      default:
        return <BellIcon className={`${iconClass} text-slate-600`} />;
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-10 rounded-full p-2">
              <BellIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Notifications</h3>
          </div>
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-white hover:text-orange-100 font-medium transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 text-sm py-1.5 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-white text-orange-600 font-semibold'
                : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 text-sm py-1.5 rounded-lg transition-colors ${
              filter === 'unread'
                ? 'bg-white text-orange-600 font-semibold'
                : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-20'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2Icon className="h-6 w-6 text-orange-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <BellIcon className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-600">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          groupedNotifications.map(group => (
            <div key={group.date} className="mb-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                {group.date}
              </h4>

              {/* Notifications for this date */}
              <div className="space-y-2">
                {group.notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      notification.read
                        ? 'border-slate-100 bg-white hover:border-slate-200'
                        : 'border-orange-200 bg-orange-50 hover:border-orange-300'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-semibold text-slate-900">
                                {notification.title}
                              </h5>
                              {!notification.read && (
                                <span className="text-[10px] font-bold uppercase text-orange-600 bg-white px-2 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-0.5">
                              {notification.message}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!notification.read) {
                                handleMarkAsRead(notification.id);
                              }
                            }}
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                          >
                            {notification.read ? 'Read' : 'Mark read'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                          <span>{formatTimestamp(notification.createdAt)}</span>
                          {notification.metadata?.senderName && (
                            <span>From {notification.metadata.senderName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {notifications.length > 0 && (
          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                onClose();
                navigate('/notifications');
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              <CheckIcon className="h-4 w-4" />
              View all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const groupNotificationsByDate = (notifications: NotificationItem[]): NotificationGroup[] => {
  const groups: { [key: string]: NotificationItem[] } = {};

  notifications.forEach(notification => {
    const date = new Date(notification.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(notification);
  });

  return Object.entries(groups)
    .map(([date, notifications]) => ({
      date,
      notifications: notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.notifications[0].createdAt).getTime() -
        new Date(a.notifications[0].createdAt).getTime()
    );
};

export default NotificationDropdown;
