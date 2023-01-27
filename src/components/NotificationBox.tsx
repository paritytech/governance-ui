import { Card } from '../ui/nextui/index.js';
import {
  NotificationType,
  useNotifications,
} from '../contexts/Notification.js';

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
        <div className="absolute bottom-4 right-4 z-50 max-w-[50%] text-xs">
          {!isTransient && (
            <div
              className="absolute right-px top-1  z-50 flex h-4 w-4 cursor-pointer justify-center"
              onClick={closeHandler}
            >
              x
            </div>
          )}
          <Card className="pl-2 pr-2" variant="shadow">
            {current.message}
          </Card>
        </div>
      )}
    </>
  );
};

export default NotificationBox;
