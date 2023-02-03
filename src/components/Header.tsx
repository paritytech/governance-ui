import { useEffect, useState } from 'react';
import { ConnectButton } from './';
import { Button, HeartIcon, Navbar } from '../ui/nextui';
import {
  areNotificationsGranted,
  requestNotificationPermission,
} from '../utils/permissions';

export function Header({
  onPermissionDenied,
}: {
  onPermissionDenied: () => void;
}): JSX.Element {
  const [notificationGranted, setNotificationGranted] = useState(true);

  useEffect(() => {
    async function fetch() {
      setNotificationGranted(await areNotificationsGranted());
    }

    fetch();
  }, []);

  return (
    <Navbar title="Open Gov">
      <>
        {!notificationGranted && (
          <Button
            color="secondary"
            rounded
            onPress={async () => {
              const permission = await requestNotificationPermission();
              if (permission !== 'granted') {
                onPermissionDenied();
              } else {
                setNotificationGranted(true);
              }
            }}
            label="Request notification"
            icon={<HeartIcon />}
          />
        )}
        <ConnectButton color="secondary" bordered />
      </>
    </Navbar>
  );
}
