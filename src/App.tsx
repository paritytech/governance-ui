import AppStateProvider from './contexts/AppState.js';
import {
  ErrorBoundary,
  Header,
  NotificationBox,
} from './ui/components/index.js';
import { DelegationPanel } from './ui/layouts/Delegation.js';

export function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <NotificationBox />
        <div className="m-auto flex h-screen flex-col">
          <Header />
          <DelegationPanel />
        </div>
      </AppStateProvider>
    </ErrorBoundary>
  );
}
