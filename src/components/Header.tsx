import { Navbar } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { NotificationType, useNotifications } from '../contexts/Notification';
import { Button, HeartIcon, Text } from './common';
import ConnectButton from './Connect';
import {
  areNotificationsGranted,
  requestNotificationPermission,
} from '../utils/permissions';

function Header(): JSX.Element {
  const { notify } = useNotifications();
  const [notificationGranted, setNotificationGranted] = useState(true);

  useEffect(() => {
    async function fetch() {
      setNotificationGranted(await areNotificationsGranted());
    }

    fetch();
  }, []);

  return (
    <Navbar variant="static">
      <Navbar.Brand>
        <Text b color="inherit">
          Open Gov
        </Text>
      </Navbar.Brand>
      <Navbar.Content>
        {!notificationGranted && (
          <Navbar.Item>
            <Button
              color="secondary"
              rounded
              onPress={async () => {
                const permission = await requestNotificationPermission();
                if (permission !== 'granted') {
                  notify({
                    type: NotificationType.Notification,
                    message: 'Notification permission has been denied',
                  });
                } else {
                  setNotificationGranted(true);
                }
              }}
              label="Request notification"
              icon={<HeartIcon primaryColor="currentColor" filled />}
            />
          </Navbar.Item>
        )}
        <Navbar.Item>
          <ConnectButton color="secondary" bordered />
        </Navbar.Item>
      </Navbar.Content>
    </Navbar>
  );
}

export default Header;
