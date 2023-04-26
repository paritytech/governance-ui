import { AppLifeCycleProvider } from './lifecycle/index.js';
import { ErrorBoundary } from './ui/components/index.js';
import WalletProvider from './contexts/Wallets.js';
import AccountProvider from './contexts/Account.js';
import { DelegationProvider } from './contexts/Delegation.js';
import { DelegationLayout } from './ui/layouts/Delegation/DelegationLayout.js';

export function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AppLifeCycleProvider>
        <WalletProvider>
          <AccountProvider>
            <DelegationProvider>
              <DelegationLayout />
            </DelegationProvider>
          </AccountProvider>
        </WalletProvider>
      </AppLifeCycleProvider>
    </ErrorBoundary>
  );
}
