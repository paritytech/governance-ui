import { Switch, Route } from 'wouter';
import Footer from '../../components/Footer.js';
import { Header, NotificationBox } from '../../components/index.js';
import { DelegationPanel } from './DelegationPanel.js';
import { SelectedDelegatePanel } from './SelectedDelegate.js';
import { useDelegation } from '../../../contexts/Delegation.js';

export function DelegationLayout() {
  const { sectionRefs } = useDelegation();
  return (
    <>
      <Header />
      <NotificationBox />
      <main
        className="flex w-full flex-auto flex-col items-center justify-center gap-8 pb-48 pt-14 md:pt-20 lg:gap-16"
        ref={sectionRefs.get('top')}
      >
        <Switch>
          <Route path="/:address">
            {({ address }) =>
              address && <SelectedDelegatePanel selectedDelegate={address} />
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
