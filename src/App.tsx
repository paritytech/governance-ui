import {
  ErrorBoundary,
  Header,
  NotificationBox,
} from './ui/components/index.js';
import { useLifeCycle } from './lifecycle/index.js';
import { DelegationPanel } from './ui/layouts/Delegation.js';

export function App(): JSX.Element {
  const [state, updater] = useLifeCycle();
  return (
    <ErrorBoundary>
      <NotificationBox
        reports={state.reports}
        removeReport={(index) => updater.removeReport(index)}
      />
      <div className="m-auto flex h-screen flex-col">
        <Header
          onPermissionDenied={() =>
            updater.addReport({
              type: 'Warning',
              message: 'Notification permission has been denied',
            })
          }
        />
        <DelegationPanel />
      </div>
    </ErrorBoundary>
  );
}
