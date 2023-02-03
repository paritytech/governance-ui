// TODO listen to changes
async function isPermissionGranted(name: PermissionName): Promise<boolean> {
  return (await navigator.permissions.query({ name })).state === 'granted';
}

export async function areNotificationsGranted(): Promise<boolean> {
  return isPermissionGranted('notifications');
}

export async function isPeriodicBackgroundSyncGranted(): Promise<boolean> {
  return isPermissionGranted('periodic-background-sync' as PermissionName);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  return Notification.requestPermission();
}
