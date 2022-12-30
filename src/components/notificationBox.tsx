import React from 'react';
import { Card } from './common';
import { NotificationType, useNotifications } from '../contexts/Notification';
import styles from './notificationBox.module.css';

const TRANSIENT_DISPLAY_TIME_MS = 3000; //milliseconds

const NotificationBox = () => {
  const { notifications, markAsRead } = useNotifications();
  const current = notifications.at(0);
  const closeHandler = () => markAsRead();
  const isTransient = current?.type === NotificationType.Notification;

  if (isTransient) {
    setTimeout(() => {
      markAsRead();
    }, TRANSIENT_DISPLAY_TIME_MS);
  }

  return (
    <>
      {current && (
        <div className={styles.notification}>
          {!isTransient && (
            <div className={styles.closeBtn} onClick={closeHandler}>
              x
            </div>
          )}
          <Card className={styles.card} variant="shadow">
            {current.message}
          </Card>
        </div>
      )}
    </>
  );
};

export default NotificationBox;
