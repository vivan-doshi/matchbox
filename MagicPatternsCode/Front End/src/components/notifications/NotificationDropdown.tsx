import React, { useState, useEffect } from 'react';
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

interface Notification {
  id: string;
  userId: string;
  type: 'project_invite' | 'message' | 'team_join' | 'project_update' | 'request_approved' | 'request_declined';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    projectId?: string;
    senderId?: string;
    senderName?: string;
    senderAvatar?: string;
  };
}

interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationRead: () => void;
}

// Mock notifications - this would come from an API in production
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: 'current-user',
    type: 'project_invite',
    title: 'Project Invitation',
    message: 'Emma Wilson invited you to join "Campus Events Platform"',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    actionUrl: '/project/1',
    metadata: {
      projectId: '1',
      senderId: '1',
      senderName: 'Emma Wilson',
      senderAvatar: 'https://i.pravatar.cc/150?img=1',
    },
  },
  {
    id: '2',
    userId: 'current-user',
    type: 'message',
    title: 'New Message',
    message: 'Marcus Johnson sent you a message',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    actionUrl: '/dashboard/chat',
    metadata: {
      senderId: '2',
      senderName: 'Marcus Johnson',
      senderAvatar: 'https://i.pravatar.cc/150?img=2',
    },
  },
  {
    id: '3',
    userId: 'current-user',
    type: 'team_join',
    title: 'Team Member Joined',
    message: 'Sophia Lee joined your project "AI Study Assistant"',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    actionUrl: '/project/2',
    metadata: {
      projectId: '2',
      senderId: '3',
      senderName: 'Sophia Lee',
      senderAvatar: 'https://i.pravatar.cc/150?img=3',
    },
  },
  {
    id: '4',
    userId: 'current-user',
    type: 'request_approved',
    title: 'Request Approved',
    message: 'Your request to join "Food Delivery App" was approved',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    actionUrl: '/project/3',
    metadata: {
      projectId: '3',
    },
  },
  {
    id: '5',
    userId: 'current-user',
    type: 'project_update',
    title: 'Project Update',
    message: 'New milestone added to "Campus Events Platform"',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    actionUrl: '/project/1',
    metadata: {
      projectId: '1',
    },
  },
];

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose, onNotificationRead }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      let filteredNotifications = MOCK_NOTIFICATIONS;
      if (filter === 'unread') {
        filteredNotifications = MOCK_NOTIFICATIONS.filter(n => !n.read);
      }

      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // In production: await api.put(`/api/notifications/${notificationId}/read`);

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
      // In production: await api.put('/api/notifications/read-all');

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    onClose();
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  const getNotificationIcon = (type: Notification['type']) => {
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
          <h3 className="text-lg font-bold text-white">Notifications</h3>
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-white hover:text-orange-100 font-medium transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'unread'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-slate-100 rounded-full p-4 mb-3">
              <BellIcon className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-slate-600 text-center">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          groupedNotifications.map(group => (
            <div key={group.date}>
              {/* Date Header */}
              <div className="sticky top-0 bg-slate-50 px-5 py-2 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {group.date}
                </p>
              </div>

              {/* Notifications for this date */}
              {group.notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 px-5 py-4 border-b border-slate-100 cursor-pointer transition-colors ${
                    !notification.read
                      ? 'bg-orange-50 hover:bg-orange-100'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Avatar or Icon */}
                  {notification.metadata?.senderAvatar ? (
                    <img
                      src={notification.metadata.senderAvatar}
                      alt={notification.metadata.senderName}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      {notification.title}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatTimestamp(notification.createdAt)}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="flex items-start pt-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                    </div>
                  )}

                  {/* Mark as Read Button */}
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <CheckIcon className="h-4 w-4 text-slate-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-200">
        <button
          onClick={onClose}
          className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Helper function to group notifications by date
const groupNotificationsByDate = (notifications: Notification[]): NotificationGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { [key: string]: Notification[] } = {};

  notifications.forEach(notification => {
    const notifDate = new Date(notification.createdAt);
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

    let dateKey: string;

    if (notifDay.getTime() === today.getTime()) {
      dateKey = 'Today';
    } else if (notifDay.getTime() === yesterday.getTime()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = notifDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: notifDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
  });

  // Sort groups by date (most recent first)
  const sortedGroups = Object.entries(groups)
    .map(([date, notifications]) => ({
      date,
      notifications: notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .sort((a, b) => {
      if (a.date === 'Today') return -1;
      if (b.date === 'Today') return 1;
      if (a.date === 'Yesterday') return -1;
      if (b.date === 'Yesterday') return 1;
      return (
        new Date(b.notifications[0].createdAt).getTime() -
        new Date(a.notifications[0].createdAt).getTime()
      );
    });

  return sortedGroups;
};

export default NotificationDropdown;
