import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'email';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    // Ensure duration has a value and is explicitly assigned
    const duration = notification.duration !== undefined ? notification.duration : 5000;
    const newNotification: Notification = {
      ...notification,
      id,
      duration,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration - only if duration is positive
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onClose 
}: { 
  notification: Notification; 
  onClose: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'email':
        return '📧';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-100 border-green-300 text-green-900';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'email':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-300 text-blue-900';
    }
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg p-4 shadow-lg animate-slide-up ${getStyles()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">{getIcon()}</span>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium">{notification.title}</p>
          {notification.message && (
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
