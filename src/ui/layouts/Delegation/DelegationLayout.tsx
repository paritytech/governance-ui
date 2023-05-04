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

export function InnerLayout({
  selectedDelegate,
}: {
  selectedDelegate?: string;
}) {
  const { sectionRefs } = useDelegation();
  const { state } = useAppLifeCycle();
  const delegatesWithTracks = useMemo(
    () => extractDelegatedTracks(state),
    [state]
  );
  const withBackArrow = useMemo(
    () => !!selectedDelegate && isValidAddress(selectedDelegate),
    [selectedDelegate]
  );
  return (
    <>
      <Header
        activeDelegateCount={delegatesWithTracks.size}
        withBackArrow={withBackArrow}
      />
      <NotificationBox />
      <main
        className="flex w-full flex-auto flex-col items-center justify-center gap-8 pb-48 pt-14 md:pt-20 lg:gap-16"
        ref={sectionRefs.get('top')}
      >
        <ScrollRestoration />
        {selectedDelegate && isValidAddress(selectedDelegate) ? (
          <SelectedDelegatePanel selectedDelegate={selectedDelegate} />
        ) : (
          <DelegationPanel />
        )}
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
