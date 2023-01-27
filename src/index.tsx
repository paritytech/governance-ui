// Must be loaded before anything else
// See https://polkadot.js.org/docs/api/FAQ/#since-upgrading-to-the-7x-series-typescript-augmentation-is-missing
import '@polkadot/api-augment';
import '@polkadot/types-augment';

import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import App from './App.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import WalletProvider from './contexts/Wallets.js';
import AccountProvider from './contexts/Account.js';
import Header from './components/Header.js';
import NotificationProvider from './contexts/Notification.js';
import NotificationBox from './components/NotificationBox.js';
import { registerServiceWorker } from './utils/service-worker.js';
import { UIProvider } from './ui/nextui/index.js';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(
    <React.StrictMode>
      <UIProvider>
        <main>
          <ErrorBoundary>
            <NotificationProvider>
              <WalletProvider>
                <AccountProvider>
                  <NotificationBox />
                  <Header />
                  <div className="flex flex-auto flex-col items-center justify-center">
                    <App />
                  </div>
                </AccountProvider>
              </WalletProvider>
            </NotificationProvider>
          </ErrorBoundary>
        </main>
      </UIProvider>
    </React.StrictMode>
  );

  registerServiceWorker().catch(() =>
    console.warn(
      "Browser doesn't support ServiceWorker; App won't be available offline"
    )
  );
}
