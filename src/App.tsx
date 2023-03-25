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

export function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AppLifeCycleProvider>
        <WalletProvider>
          <AccountProvider>
            <NotificationBox />
            <div className="m-auto flex h-screen flex-col">
              <Header />
              <DelegationPanel />
            </div>
            <Footer />
          </AccountProvider>
        </WalletProvider>
      </AppLifeCycleProvider>
    </ErrorBoundary>
  );
}
