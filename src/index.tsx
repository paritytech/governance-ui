// Must be loaded before anything else
// See https://polkadot.js.org/docs/api/FAQ/#since-upgrading-to-the-7x-series-typescript-augmentation-is-missing
import '@polkadot/api-augment';
import '@polkadot/types-augment';

import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import WalletProvider from './contexts/Wallets';
import AccountProvider from './contexts/Account';
import ApiProvider from './contexts/Api';
import Header from './components/Header';
import NotificationProvider from './contexts/Notification';
import NotificationBox from './components/NotificationBox';
import { registerServiceWorker } from './utils/service-worker';

const theme = createTheme({
  type: 'light',
  theme: {
    fonts: {
      sans: 'Unbounded',
    },
    colors: {
      primary: '#e6007a',
    },
  },
});

const container = document.getElementById('root');
if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(
    <React.StrictMode>
      <NextUIProvider theme={theme}>
        <main>
          <ErrorBoundary>
            <NotificationProvider>
              <ApiProvider>
                <WalletProvider>
                  <AccountProvider>
                    <NotificationBox />
                    <Header />
                    <App />
                  </AccountProvider>
                </WalletProvider>
              </ApiProvider>
            </NotificationProvider>
          </ErrorBoundary>
        </main>
      </NextUIProvider>
    </React.StrictMode>
  );

  registerServiceWorker().catch(() =>
    console.warn(
      "Browser doesn't support ServiceWorker; App won't be available offline"
    )
  );
}

window.addEventListener('unhandledrejection', function (event) {
  console.error(
    `Unhandled promise rejection for ${event.promise}: ${event.reason}`
  );
});
