import { useEffect, useState } from 'react';
import { ConnectButton } from './';
import { Button, HeartIcon, Navbar } from '../ui/nextui';
import {
  areNotificationsGranted,
  requestNotificationPermission,
} from '../utils/permissions';

const tokenUrl = new URL(
  '../../assets/images/polkadot-token.svg',
  import.meta.url
).toString();
const logoUrl = new URL(
  '../../assets/images/polkadot-logo.svg',
  import.meta.url
).toString();

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
          <div className="flex w-full  justify-start gap-2 md:justify-end">
            {!notificationGranted && (
              <Button
                onClick={async () => {
                  const permission = await requestNotificationPermission();
                  if (permission !== 'granted') {
                    onPermissionDenied();
                  } else {
                    setNotificationGranted(true);
                  }
                }}
              >
                <HeartIcon className="fill-primary" />
              </Button>
            )}
            <ConnectButton />
          </div>
        </Navbar.Item>
      </Navbar.Content>
    </Navbar>
  );
}
