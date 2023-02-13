// Must be loaded before anything else
// See https://polkadot.js.org/docs/api/FAQ/#since-upgrading-to-the-7x-series-typescript-augmentation-is-missing
import '@polkadot/api-augment/kusama';
import '@polkadot/rpc-augment';
import '@polkadot/types-augment';

import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { App } from './App.js';
import AccountProvider from './contexts/Account.js';
import WalletProvider from './contexts/Wallets.js';
import { registerServiceWorker } from './utils/service-worker.js';

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOMClient.createRoot(container).render(
  <React.StrictMode>
    <WalletProvider>
      <AccountProvider>
        <App />
      </AccountProvider>
    </WalletProvider>
  </React.StrictMode>
);

registerServiceWorker().catch(() =>
  console.warn(
    "Browser doesn't support ServiceWorker; App won't be available offline"
  )
);
