import React, { useMemo, createContext, useContext } from 'react';
import { WalletAggregator, BaseWallet } from '@polkadot-onboard/core';
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets';
import {
  PolkadotWalletsContextProvider,
  useWallets as _useWallets,
} from '@polkadot-onboard/react';

const APP_NAME = 'Swipe to Vote';

export const useWallets = () => useContext(WalletContext);

const WalletContext = createContext({});

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  let walletAggregator = new WalletAggregator([
    new InjectedWalletProvider({}, APP_NAME),
  ]);
  return (
    <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
      <WalletProviderInner>{children}</WalletProviderInner>
    </PolkadotWalletsContextProvider>
  );
};

const WalletProviderInner = ({ children }: { children: React.ReactNode }) => {
  let { wallets } = _useWallets();
  return (
    <WalletContext.Provider value={{ wallets }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
