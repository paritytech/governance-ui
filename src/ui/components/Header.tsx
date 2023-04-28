import { ConnectButton } from './accounts/ConnectButton.js';
import { Navbar } from '../lib/index.js';
import { useLocation } from 'wouter';

const tokenUrl = new URL(
  '../../../assets/images/polkadot-token.svg',
  import.meta.url
).toString();
const logoUrl = new URL(
  '../../../assets/images/polkadot-logo.svg',
  import.meta.url
).toString();

export function Header({
  activeDelegateCount,
}: {
  activeDelegateCount: number;
}): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLocation] = useLocation();
  return (
    <Navbar>
      <Navbar.Brand>
        <div className="cursor-pointer" onClick={() => setLocation('/')}>
          <div className="sticky top-0 -z-10 w-full">
            <div className="h-8 w-fit md:hidden">
              <img
                className="inline h-full"
                src={tokenUrl}
                alt="polkadot logo"
              />
            </div>
            <div className="hidden h-8 items-center gap-2 md:flex">
              <img
                className="inline h-full"
                src={logoUrl}
                alt="polkadot logo"
              />
              <div className="h-6 w-[2px] bg-gray-400" />
              <span className="font-unbounded text-h5">
                Delegation Dashboard
              </span>
              {!!activeDelegateCount && (
                <span className="font-unbounded text-xl font-normal text-fg-disabled">{`${activeDelegateCount} active`}</span>
              )}
            </div>
          </div>
        </div>
      </Navbar.Brand>
      <Navbar.Content>
        <Navbar.Item>
          <div className="flex justify-start gap-2 md:justify-end">
            <ConnectButton />
          </div>
        </Navbar.Item>
      </Navbar.Content>
    </Navbar>
  );
}
