import { ConnectButton } from './accounts/ConnectButton.js';
import { Navbar } from '../lib/index.js';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, InformationalIcon } from '../icons/index.js';

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
  const currentInfo = localStorage.getItem('headlineVisible');

  return (
    <Navbar>
      <Navbar.Brand>
        <Link to="/">
          <div className="cursor-pointer">
            <div className="sticky top-0 -z-10 w-full">
              <div className="flex h-8 items-center gap-2">
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
                <span className="hidden font-unbounded text-h5 md:block">
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
          <div className="flex items-center justify-start gap-2 md:justify-end">
            {currentInfo === 'true' && (
              <button
                className="flex h-fit w-fit cursor-pointer items-center justify-center rounded-full bg-white p-2"
                onClick={() => {
                  window.location.reload();
                  window.localStorage.setItem('headlineVisible', 'false');
                }}
              >
                <InformationalIcon size="20" />
              </button>
            )}
            <ConnectButton />
          </div>
        </Navbar.Item>
      </Navbar.Content>
    </Navbar>
  );
}
