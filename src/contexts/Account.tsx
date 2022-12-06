import { Account } from '@polkadot-onboard/core';
import type { Signer } from '@polkadot/api/types';
import React, { useContext, createContext, useState, useEffect } from 'react';
import { useWallets, WalletStateStorage } from './Wallets';

export type SigningAccount = { account: Account; signer: Signer };

// account context
const CONNECTED_ADRR_STORAGE_KEY = 'connectedAddress';
const accountContext = createContext({});
export const useAccount = () => useContext(accountContext);

const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [connectedAccount, _setConnectedAccount] = useState<SigningAccount>();
  let { wallets } = useWallets();

  const getConnectedAddress = () =>
    localStorage.getItem(CONNECTED_ADRR_STORAGE_KEY);
  const setConnectedAddress = (address: string) =>
    localStorage.setItem(CONNECTED_ADRR_STORAGE_KEY, address);

  const loadConnectedAccount = async (): Promise<SigningAccount | null> => {
    const connectedWalletsAccounts = await getConnectedWalletsAccounts();
    let connectedAccount = null;
    let connectedAddress = getConnectedAddress();
    if (connectedAddress) {
      connectedAccount = connectedWalletsAccounts[connectedAddress];
    }
    return connectedAccount;
  };

  const getConnectedWalletsAccounts = () => {
    let signingAccounts = {};
    for (let wallet of wallets) {
      let signer = wallet.signer;
      if (signer && WalletStateStorage.isConnected(wallet)) {
        let walletSigningAccounts = {};
        let walletAccounts = wallet.getAccoutns();
        if (walletAccounts.length > 0) {
          for (let account of walletAccounts) {
            walletSigningAccounts[account.address] = { account, signer };
          }
          signingAccounts = { ...signingAccounts, ...walletSigningAccounts };
        }
      }
    }
    return signingAccounts;
  };

  const setConnectedAccount = (signingAccount: SigningAccount) => {
    setConnectedAddress(signingAccount.account.address);
    _setConnectedAccount(signingAccount);
  };

  useEffect(() => {
    loadConnectedAccount().then((signingAccount: SigningAccount | null) => {
      if (signingAccount) {
        setConnectedAccount(signingAccount);
      }
    });
  }, [getConnectedAddress()]);

  return (
    <accountContext.Provider
      value={{
        connectedAccount,
        setConnectedAccount,
        getConnectedWalletsAccounts,
      }}
    >
      {children}
    </accountContext.Provider>
  );
};

export default AccountProvider;
