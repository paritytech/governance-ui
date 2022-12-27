import React, { useContext, createContext, useState } from 'react';

export enum NotificationType {
  Error,
  Notification,
}
export interface INotification {
  type: NotificationType;
  message: string;
}
export interface INotificationContext {
  notifications: Array<INotification>;
  notify: (notification: INotification) => void;
  markAsRead: () => void;
}

const notificationContext = createContext({} as INotificationContext);
export const useNotifications = () => useContext(notificationContext);

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  // notification queue
  const [notifications, setNotifications] = useState<Array<INotification>>([]);

  // adds a notification to the queue
  const notify = (notification: INotification) => {
    setNotifications((notifications) => [...notifications, notification]);
  };

  // removes the next notification from the queue.
  const markAsRead = () => {
    console.log('read');
    setNotifications((notifications) => [...notifications.slice(1)]);
  };
  return (
    <notificationContext.Provider value={{ notifications, notify, markAsRead }}>
      {children}
    </notificationContext.Provider>
  );
};

export default NotificationProvider;
