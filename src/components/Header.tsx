import { useEffect, useState } from 'react';
import { NotificationType, useNotifications } from '../contexts/Notification';
import { Button, HeartIcon } from '../ui/nextui';
import Navbar from '../ui/nextui/Navbar';
import ConnectButton from './Connect';
import {
  areNotificationsGranted,
  requestNotificationPermission,
} from '../utils/permissions';

const tokenUrl = new URL(
  '../../assets/images/polkadot-token.svg',
  import.meta.url
);
const logoUrl = new URL(
  '../../assets/images/polkadot-logo.svg',
  import.meta.url
);

function Header(): JSX.Element {
  const { notify } = useNotifications();
  const [notificationGranted, setNotificationGranted] = useState(true);

  useEffect(() => {
    async function fetch() {
      setNotificationGranted(await areNotificationsGranted());
    }

    fetch();
  }, []);
  console.log(Navbar);
  return (
    <Navbar>
      <Navbar.Brand>
        <div>
          <div className="h-8 md:hidden">
            <img className="inline h-full" src={tokenUrl} alt="polkadot logo" />
          </div>
          <div className="hidden h-8 md:block">
            <img className="inline h-full" src={logoUrl} alt="polkadot logo" />
            <span className="align-middle">| Open Governance</span>
          </div>
        </div>
      </Navbar.Brand>
      <Navbar.Content className="w-full">
        <Navbar.Item className="w-full">
          <div className="flex w-full justify-start md:justify-end">
            {!notificationGranted && (
              <Button
                onClick={async () => {
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
              >
                <HeartIcon />
              </Button>
            )}
            <ConnectButton />
          </div>
        </Navbar.Item>
      </Navbar.Content>
    </Navbar>
  );
}

export default Header;
