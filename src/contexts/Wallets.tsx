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

const getStatefulWallets = (wallets: Array<BaseWallet>) => {
  const storage = window.localStorage;
  const transformWallet = (wallet: BaseWallet): BaseWallet => {
    let sKey = `wallet#${wallet.metadata.title}`;
    return {
      ...wallet,
      connect: async () => {
        await wallet.connect();
        storage.setItem(sKey, 'connected');
      },
      disconnect: async () => {
        await wallet.disconnect();
        storage.removeItem(sKey);
      },
      isConnected: () => {
        let walletState = storage.getItem(sKey);
        return walletState == 'connected';
      },
    };
  };
  let transformed = wallets.map((wallet) => transformWallet(wallet));
  return transformed;
};

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
  const statefulWallets = getStatefulWallets(wallets);
  return (
    <WalletContext.Provider value={{ wallets: statefulWallets }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
