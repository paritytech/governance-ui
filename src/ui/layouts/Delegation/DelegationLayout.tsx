import { useMemo } from 'react';
import { Switch, Route, Redirect } from 'wouter';
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

export function DelegationLayout() {
  const { sectionRefs } = useDelegation();
  const { state } = useAppLifeCycle();
  const delegatesWithTracks = useMemo(
    () => extractDelegatedTracks(state),
    [state]
  );
  return (
    <>
      <Header activeDelegateCount={delegatesWithTracks.size} />
      <NotificationBox />
      <main
        className="flex w-full flex-auto flex-col items-center justify-center gap-8 pb-48 pt-14 md:pt-20 lg:gap-16"
        ref={sectionRefs.get('top')}
      >
        <Switch>
          <Route path="/:address">
            {({ address }) =>
              address && isValidAddress(address) ? (
                <SelectedDelegatePanel selectedDelegate={address} />
              ) : (
                <Redirect to={'/'} />
              )
            }
          </Route>
          <Route>
            <DelegationPanel />
          </Route>
        </Switch>
      </main>
      <Footer />
    </>
  );
}
