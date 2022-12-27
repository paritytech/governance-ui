import { NotificationType, useNotifications } from '../contexts/Notification';
import styles from './notificationBox.module.css';
import { Card } from './common';

const TRANSIENT_DISPLAY_TIME_MS = 3000; //milliseconds
const NotificationBox = () => {
  const { notifications, markAsRead } = useNotifications();
  const current = notifications?.[0];
  const isTransient = current?.type === NotificationType.Notification;
  const closeHandler = () => markAsRead();
  if (isTransient) {
    setTimeout(() => {
      markAsRead();
    }, TRANSIENT_DISPLAY_TIME_MS);
  }
  return (
    current && (
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
    )
  );
};

export default NotificationBox;
