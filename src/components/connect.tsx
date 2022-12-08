import { BaseWallet } from '@polkadot-onboard/core';
import React, { useEffect, useState } from 'react';
import { useAccount } from '../contexts/Account';
import type { SigningAccount } from '../contexts/Account';
import { useWallets } from '../contexts/Wallets';
import { Button, Modal } from './common';
import Account from './account';
import Wallet from './wallet';
const WalletsList = ({ wallets, walletState, walletConnectHandler }) => {
  return (
    <div>
      {wallets?.map((wallet) => {
        const name = wallet?.metadata.title;
        const iconUrl = wallet?.metadata.iconUrl;
        const isConnected =
          walletState[`${wallet?.metadata.title}`] === 'connected';
        return (
          <Wallet
            name={name}
            state={{ isConnected }}
            clickHandler={() => walletConnectHandler(wallet)}
          />
        );
      })}
    </div>
  );
};
const AccountList = ({ accounts, connectedAccount, accountConnectHandler }) => {
  return (
    <div>
      {Object.values(accounts).map((signingAccount) => {
        const { account } = signingAccount;
        const isConnected =
          connectedAccount &&
          connectedAccount.account.address === account.address;
        return (
          <Account
            name={account.name}
            address={account.address}
            meta={{ isConnected }}
            clickHandler={() => accountConnectHandler(signingAccount)}
          />
        );
      })}
    </div>
  );
};

type ConnectViews = 'wallets' | 'accounts';

const ConnectModal = () => {
  const [visible, setVisible] = useState(false);
  const [currentView, setCurrentView] = useState<ConnectViews>();
  const { wallets, walletState, setWalletState } = useWallets();
  const { connectedAccount, setConnectedAccount, walletsAccounts } =
    useAccount();

  const loadedAccountsCount = walletsAccounts
    ? Object.keys(walletsAccounts).length
    : 0;

  const initialView: ConnectViews =
    loadedAccountsCount > 0 ? 'accounts' : 'wallets';

  const toggleView = () => {
    setCurrentView((oldView) =>
      oldView === 'wallets' ? 'accounts' : 'wallets'
    );
  };
  const walletConnectHandler = async (wallet: BaseWallet) => {
    if (walletState[wallet?.metadata.title] == 'connected') {
      await wallet.disconnect();
      setWalletState(wallet?.metadata.title, 'disconnected');
    } else {
      await wallet.connect();
      setWalletState(wallet?.metadata.title, 'connected');
    }
  };
  const accountConnectHandler = async (signingAccount: SigningAccount) => {
    setConnectedAccount(signingAccount);
    closeModal();
  };
  const closeModal = () => {
    setVisible(false);
  };
  const openModal = () => {
    setCurrentView(initialView);
    setVisible(true);
  };
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);
  return (
    <>
      <Button color="secondary" onPress={() => openModal()}>
        Connect
      </Button>
      <Modal visible={visible} onClose={() => closeModal()}>
        <div onClick={() => toggleView()}>{`${
          currentView === 'accounts'
            ? '< wallets'
            : loadedAccountsCount
            ? 'accounts >'
            : ''
        }`}</div>
        {currentView === 'accounts' && (
          <AccountList
            accounts={walletsAccounts}
            connectedAccount={connectedAccount}
            accountConnectHandler={accountConnectHandler}
          />
        )}
        {currentView === 'wallets' && (
          <WalletsList
            wallets={wallets}
            walletState={walletState}
            walletConnectHandler={walletConnectHandler}
          />
        )}
      </Modal>
    </>
  );
};

export default ConnectModal;
