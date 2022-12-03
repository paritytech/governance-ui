import { createContext, useContext } from 'react';
import { WalletAggregator, BaseWallet } from '@polkadot-onboard/core';
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets';
import {
  PolkadotWalletsContextProvider,
  useWallets as _useWallets,
} from '@polkadot-onboard/react';
import { useMemo } from 'react';

const APP_NAME = 'Swipe to Vote';

export const useWallets = () => useContext(walletContext);

const walletContext = createContext({});

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

const WalletProviderInner = ({ children }: { children: React.ReactNode }) => {
  let { wallets } = _useWallets();
  const statefulWallets = useMemo(() => {
    return getStatefulWallets(wallets);
  }, [...wallets]);
  return (
    <walletContext.Provider value={statefulWallets}>
      {children}
    </walletContext.Provider>
  );
};

export default WalletProvider;
