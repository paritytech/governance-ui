import { AppLifeCycleProvider } from './lifecycle/index.js';
import {
  ErrorBoundary,
  Header,
  NotificationBox,
} from './ui/components/index.js';
import { DelegationPanel } from './ui/layouts/Delegation.js';

export function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AppLifeCycleProvider>
        <NotificationBox />
        <div className="m-auto flex h-screen flex-col">
          <Header />
          <DelegationPanel />
        </div>
      </AppLifeCycleProvider>
    </ErrorBoundary>
  );
}
