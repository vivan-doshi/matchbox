import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BellIcon } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { apiClient } from '../../utils/apiClient';

/**
 * Reusable Notification Bell component with unread count badge and dropdown
 * Can be added to any page header for consistent notification access
 */
const NotificationBell: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.getNotificationUnreadCount();
      if (response.success && typeof response.count === 'number') {
        setUnreadCount(response.count);
      } else if (typeof response.count === 'number') {
        setUnreadCount(response.count);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleNotificationRead = () => {
    fetchUnreadCount();
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <NotificationDropdown
          onClose={() => setShowNotifications(false)}
          onNotificationRead={handleNotificationRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;
