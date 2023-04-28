import { ConnectButton } from './accounts/ConnectButton.js';
import { Navbar } from '../lib/index.js';
import { Link } from 'wouter';
import { ArrowLeftIcon } from '../icons/index.js';

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
  withBackArrow,
}: {
  activeDelegateCount: number;
  withBackArrow: boolean;
}): JSX.Element {
  return (
    <Navbar>
      <Navbar.Brand>
        <Link href="/">
          <div className="cursor-pointer">
            <div className="sticky top-0 -z-10 w-full">
              <div className="h-8 w-fit md:hidden">
                <img
                  className="inline h-full"
                  src={tokenUrl}
                  alt="polkadot logo"
                />
              </div>
              <div className="hidden h-8 items-center gap-2 md:flex">
                {withBackArrow ? (
                  <ArrowLeftIcon className="stroke-[4px]" />
                ) : (
                  <>
                    <img
                      className="inline h-full"
                      src={logoUrl}
                      alt="polkadot logo"
                    />
                    <div className="h-6 w-[2px] bg-gray-400" />
                  </>
                )}
                <span className="font-unbounded text-h5">
                  Delegation Dashboard
                </span>
                {!!activeDelegateCount && (
                  <span className="font-unbounded text-xl font-normal text-fg-disabled">{`${activeDelegateCount} active`}</span>
                )}
              </div>
            </div>
          </div>
        </Link>
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
