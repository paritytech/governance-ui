import { Route } from 'wouter';
import { AppLifeCycleProvider } from './lifecycle/index.js';
import Footer from './ui/components/Footer.js';
import {
  ErrorBoundary,
  Header,
  NotificationBox,
} from './ui/components/index.js';
import { DelegationPanel } from './ui/layouts/DelegationPanel.js';
import WalletProvider from './contexts/Wallets.js';
import AccountProvider from './contexts/Account.js';
import { DelegationProvider } from './contexts/Delegation.js';

function Main({
  selectedDelegate,
}: {
  selectedDelegate?: string;
}): JSX.Element {
  return (
    <>
      <Header />
      <NotificationBox />
      <DelegationPanel selectedDelegate={selectedDelegate} />
      <Footer />
    </>
  );
}

export function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AppLifeCycleProvider>
        <WalletProvider>
          <AccountProvider>
            <DelegationProvider>
              <Route path="/:address">
                {({ address }) => <Main selectedDelegate={address} />}
              </Route>
              <Route path="/">
                <Main />
              </Route>
            </DelegationProvider>
          </AccountProvider>
        </WalletProvider>
      </AppLifeCycleProvider>
    </ErrorBoundary>
  );
}
