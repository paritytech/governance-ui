import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import App from './app';
import { registerServiceWorker } from './utils/service-worker';

const theme = createTheme({
  type: 'light',
  theme: {
    fonts: {
      sans: 'Unbounded',
    },
  },
});

const container = document.getElementById('root');
if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(
    <React.StrictMode>
      <NextUIProvider theme={theme}>
        <main style={{ display: 'flex', height: '100vh' }}>
          <App />
        </main>
      </NextUIProvider>
    </React.StrictMode>
  );

  registerServiceWorker();
}
