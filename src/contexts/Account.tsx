import { Account, WalletMetadata } from '@polkadot-onboard/core';
import type { Signer } from '@polkadot/api/types';
import React, { useContext, createContext, useState, useEffect } from 'react';
import { useWallets } from './Wallets';

export type SigningAccount = {
  account: Account;
  signer: Signer;
  sourceMetadata: WalletMetadata;
};

// account context

const accountContext = createContext({});
export const useAccount = () => useContext(accountContext);

/**
 * Provides a local storage utility class to store the connected account address.
 */
export class AccountStorage {
  static CONNECTED_ADRR_STORAGE_KEY = 'connectedAddress';
  static getConnectedAddress = () =>
    localStorage.getItem(this.CONNECTED_ADRR_STORAGE_KEY);
  static setConnectedAddress = (address: string) =>
    localStorage.setItem(this.CONNECTED_ADRR_STORAGE_KEY, address);
}

const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [_connectedAccount, _setConnectedAccount] = useState<SigningAccount>();
  const { wallets, walletState } = useWallets();
  const [walletsAccounts, setWalletsAccounts] =
    useState<Record<string, SigningAccount>>();

  const loadConnectedAccount = async (): Promise<SigningAccount | null> => {
    const walletsAccounts = await getWalletsAccounts();
    let connectedAccount = null;
    let connectedAddress = AccountStorage.getConnectedAddress();
    if (connectedAddress) {
      connectedAccount = walletsAccounts[connectedAddress];
    }
    return connectedAccount;
  };

  const getWalletsAccounts = async () => {
    let signingAccounts = {};
    for (let wallet of wallets) {
      let {
        signer,
        metadata: { title },
      } = wallet;
      if (signer && walletState[title] === 'connected') {
        let walletSigningAccounts = {};
        let walletsAccounts = await wallet.getAccounts();
        if (walletsAccounts.length > 0) {
          for (let account of walletsAccounts) {
            walletSigningAccounts[account.address] = {
              account,
              signer,
              sourceMetadata: wallet.metadata,
            };
          }
          signingAccounts = { ...signingAccounts, ...walletSigningAccounts };
        }
      }
    }
    return signingAccounts;
  };

  const accountSourceIsConnected = (signingAccount: SigningAccount) => {
    const {
      sourceMetadata: { title },
    } = signingAccount;
    return walletState[title] === 'connected';
  };

  const setConnectedAccount = (signingAccount: SigningAccount) => {
    AccountStorage.setConnectedAddress(signingAccount.account.address);
    _setConnectedAccount(signingAccount);
  };

  useEffect(() => {
    loadConnectedAccount().then((signingAccount: SigningAccount | null) => {
      if (signingAccount) {
        setConnectedAccount(signingAccount);
      }
    });
  }, [AccountStorage.getConnectedAddress()]);

  useEffect(() => {
    getWalletsAccounts().then((accounts: Record<string, SigningAccount>) => {
      setWalletsAccounts(accounts);
    });
  }, [wallets, walletState]);

  const connectedAccount =
    _connectedAccount && accountSourceIsConnected(_connectedAccount)
      ? _connectedAccount
      : undefined;
  return (
    <accountContext.Provider
      value={{
        connectedAccount,
        setConnectedAccount,
        walletsAccounts,
      }}
    >
      {children}
    </accountContext.Provider>
  );
};

export default AccountProvider;
