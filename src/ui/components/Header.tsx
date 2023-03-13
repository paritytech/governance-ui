import { ConnectButton } from './accounts/ConnectButton.js';
import { Navbar } from '../lib/index.js';

const tokenUrl = new URL(
  '../../../assets/images/polkadot-token.svg',
  import.meta.url
).toString();
const logoUrl = new URL(
  '../../../assets/images/polkadot-logo.svg',
  import.meta.url
).toString();

export function Header(): JSX.Element {
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
            <ConnectButton />
          </div>
        </Navbar.Item>
      </Navbar.Content>
    </Navbar>
  );
}
