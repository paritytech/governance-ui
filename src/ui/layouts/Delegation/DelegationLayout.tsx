import { useMemo } from 'react';
import {
  Route,
  createHashRouter,
  RouterProvider,
  createRoutesFromElements,
  Navigate,
  useParams,
  ScrollRestoration,
} from 'react-router-dom';
import Footer from '../../components/Footer.js';
import { Header, NotificationBox } from '../../components/index.js';
import { DelegationPanel } from './DelegationPanel.js';
import { SelectedDelegatePanel } from './SelectedDelegate.js';
import { useDelegation } from '../../../contexts/Delegation.js';
import { isValidAddress } from '../../../utils/polkadot-api.js';
import {
  useAppLifeCycle,
  extractDelegatedTracks,
} from '../../../lifecycle/index.js';
import { Button } from '../../lib/Button.js';
import { SoftwareDevelopmentIcon, CopyIcon } from '../../icons/index.js';
import CopyToClipboard from 'react-copy-to-clipboard';

export function InnerLayout({
  selectedDelegate,
}: {
  selectedDelegate?: string;
}) {
  const { sectionRefs } = useDelegation();
  const { state, updater } = useAppLifeCycle();
  const delegatesWithTracks = useMemo(
    () => extractDelegatedTracks(state),
    [state]
  );
  const withBackArrow = useMemo(
    () => !!selectedDelegate && isValidAddress(selectedDelegate),
    [selectedDelegate]
  );
  function generateShareLink() {
    return location.href;
  }
  return (
    <>
      <Header
        activeDelegateCount={delegatesWithTracks.size}
        withBackArrow={withBackArrow}
      />
      <NotificationBox />
      <main ref={sectionRefs.get('top')}>
        <ScrollRestoration />
        <div className="mx-1 flex h-screen flex-col content-center justify-center space-y-12 text-center md:hidden">
          <div className="flex content-center justify-center">
            <SoftwareDevelopmentIcon size="60" />
          </div>
          <div>
            Please visit Delegation Dashboard from your Desktop computer.
          </div>
          <CopyToClipboard
            text={generateShareLink()}
            onCopy={() =>
              updater.addReport({
                type: 'Info',
                message: 'Page link copied to clipboard!',
              })
            }
          >
            <Button variant="outline" className="mx-auto">
              <CopyIcon />
              <div>Copy page link</div>
            </Button>
          </CopyToClipboard>
        </div>
        <div className=" hidden w-full flex-auto flex-col items-center justify-center gap-8 pb-48 pt-14 md:flex md:pt-20 lg:gap-16">
          {selectedDelegate && isValidAddress(selectedDelegate) ? (
            <SelectedDelegatePanel selectedDelegate={selectedDelegate} />
          ) : (
            <DelegationPanel />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function InnerLayoutWithAddress(): JSX.Element {
  const { address } = useParams();
  if (address && isValidAddress(address)) {
    return <InnerLayout selectedDelegate={address} />;
  } else {
    return <Navigate replace to={'/'} />;
  }
}

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<InnerLayout />} />
      <Route path="/:address" element={<InnerLayoutWithAddress />} />
    </>
  )
);

export function DelegationLayout() {
  return <RouterProvider router={router} />;
}
