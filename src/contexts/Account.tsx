import type { SigningAccount } from '../types';

import React, { useContext, createContext, useState, useEffect } from 'react';
import { extractChainInfo, useAppLifeCycle } from '../lifecycle/index.js';
import { useWallets } from './Wallets.js';
import {
  isSubstrateAccount,
  isAccountAllowedOnChain,
} from '../utils/polkadot-api.js';

export interface IAccountContext {
  connectedAccount: SigningAccount | undefined;
  walletsAccounts: Map<string, SigningAccount>;
  setConnectedAccount: (signingAccount: SigningAccount | undefined) => void;
}
// account context
const accountContext = createContext({} as IAccountContext);
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
  const { state, updater } = useAppLifeCycle();
  const { genesisHash } = extractChainInfo(state) || {};
  const [_connectedAccount, _setConnectedAccount] = useState<
    SigningAccount | undefined
  >();
  const { wallets, walletState } = useWallets();
  const [walletsAccounts, setWalletsAccounts] = useState<
    Map<string, SigningAccount>
  >(new Map<string, SigningAccount>());

  const loadConnectedAccount = async (): Promise<
    SigningAccount | undefined
  > => {
    const walletsAccounts = await getWalletsAccounts();
    const connectedAddress = AccountStorage.getConnectedAddress();
    if (connectedAddress) {
      return walletsAccounts.get(connectedAddress);
    }
  };

  const getWalletsAccounts = async () => {
    let signingAccounts = new Map<string, SigningAccount>();
    for (const wallet of wallets) {
      const {
        signer,
        metadata: { title },
      } = wallet;
      if (signer && walletState.get(title) === 'connected') {
        const walletSigningAccounts = new Map<string, SigningAccount>();

        // filter accounts that match the genesis hash.
        const accounts = (await wallet.getAccounts()).filter(
          (account) =>
            isSubstrateAccount(account) &&
            isAccountAllowedOnChain(account, genesisHash)
        );

        if (accounts.length > 0) {
          for (const account of accounts) {
            walletSigningAccounts.set(account.address, {
              account,
              signer,
              sourceMetadata: wallet.metadata,
            });
          }
          signingAccounts = new Map([
            ...signingAccounts,
            ...walletSigningAccounts,
          ]);
        }
      }
    }
    return signingAccounts;
  };

  const accountSourceIsConnected = (signingAccount: SigningAccount) => {
    const {
      sourceMetadata: { title },
    } = signingAccount;
    return walletState.get(title) === 'connected';
  };

  const setConnectedAccount = (
    signingAccount: SigningAccount | undefined,
    persist = true
  ) => {
    const connectedAddress = signingAccount?.account.address;
    persist && AccountStorage.setConnectedAddress(connectedAddress || '');
    _setConnectedAccount(signingAccount);
    updater.setConnectedAddress(connectedAddress || null);
  };

  // load connected account from storage
  const storedConnectedAddress = AccountStorage.getConnectedAddress();
  useEffect(() => {
    if (storedConnectedAddress) {
      loadConnectedAccount().then((signingAccount) => {
        if (signingAccount) {
          // connected account might have changed, persist the address in storage
          setConnectedAccount(signingAccount, true);
        } else {
          // was not able to load the connected account based on storedConnectedAddress,
          // hence (persist=false) to reset the state but not clearing the local storage value .
          setConnectedAccount(undefined, false);
        }
      });
    }
  }, [storedConnectedAddress, walletsAccounts]);

  // load accounts from connected wallets
  useEffect(() => {
    getWalletsAccounts().then((accounts: Map<string, SigningAccount>) => {
      setWalletsAccounts(accounts);
    });
  }, [wallets, walletState, genesisHash]);

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
