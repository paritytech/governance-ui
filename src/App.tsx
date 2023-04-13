import { AppLifeCycleProvider } from './lifecycle/index.js';
import Footer from './ui/components/Footer.js';
import {
  ErrorBoundary,
  Header,
  NotificationBox,
} from './ui/components/index.js';
import { DelegationPanel } from './ui/layouts/Delegation.js';
import WalletProvider from './contexts/Wallets.js';
import AccountProvider from './contexts/Account.js';
import { DelegationProvider } from './contexts/Delegation.js';

export function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AppLifeCycleProvider>
        <WalletProvider>
          <AccountProvider>
            <DelegationProvider>
              <Header />
              <NotificationBox />
              <DelegationPanel />
              <Footer />
            </DelegationProvider>
          </AccountProvider>
        </WalletProvider>
      </AppLifeCycleProvider>
    </ErrorBoundary>
  );
}
