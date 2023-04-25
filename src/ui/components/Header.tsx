import { ConnectButton } from './accounts/ConnectButton.js';
import { Navbar } from '../lib/index.js';
import ThemeSwitch from './ThemeSwitch.js';
import PolkadotLogo from '../icons/PolkadotLogo.js';

export function Header(): JSX.Element {
  return (
    <Navbar>
      <Navbar.Brand>
        <div className="sticky top-0 -z-10 w-full">
          <div className="hidden h-8 items-center gap-3 md:flex">
            <PolkadotLogo />
            <div className="bg-fill-separator h-6 w-[2px]" />
            <span className="text-foreground-contrast font-unbounded text-h5">
              Open Governance
            </span>
          </div>
        </div>
      </Navbar.Brand>
      <Navbar.Content>
        <Navbar.Item>
          <div className="flex justify-start gap-2 md:justify-end">
            <ThemeSwitch />
            <ConnectButton />
          </div>
        </Navbar.Item>
      </Navbar.Content>
    </Navbar>
  );
}
