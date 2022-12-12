import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import App from './app';
import { ErrorBoundary } from './components/error-boundary';
import WalletProvider from './contexts/Wallets';
import AccountProvider from './contexts/Account';
import Header from './components/header';
import '@polkadot/api-augment';
import '@polkadot/types-augment';

const theme = createTheme({
  type: 'light',
  theme: {
    fonts: {
      sans: 'Unbounded',
    },
    colors: {
      primary: '#e6007a',
    }
  },
});

const container = document.getElementById('root');
if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(
    <React.StrictMode>
      <NextUIProvider theme={theme}>
        <main
          style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
        >
          <ErrorBoundary>
            <WalletProvider>
              <AccountProvider>
                <Header />
                <App />
              </AccountProvider>
            </WalletProvider>
          </ErrorBoundary>
        </main>
      </NextUIProvider>
    </React.StrictMode>
  );

  // TODO disable for now, helps during dev
  // registerServiceWorker();
}

window.addEventListener('unhandledrejection', function (event) {
  console.error(
    `Unhandled promise rejection for ${event.promise}: ${event.reason}`
  );
});
