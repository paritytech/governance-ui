import { BaseWallet } from '@polkadot-onboard/core';
import React, { useEffect, useState } from 'react';
import { useAccount } from '../contexts/Account';
import type { SigningAccount } from '../contexts/Account';
import { useWallets } from '../contexts/Wallets';
import { Button, Modal } from './common';
const WalletsList = ({ wallets, walletState, walletConnectHandler }) => {
  return (
    <div>
      {wallets?.map((wallet) => (
        // ToDo: add an account connect modal
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <div onClick={() => walletConnectHandler(wallet)}>
            {`${wallet?.metadata?.title}`}
          </div>
          <div>
            {`${
              walletState[`${wallet?.metadata.title}`] === 'connected'
                ? 'connected'
                : 'disconnected'
            }`}
          </div>
        </div>
      ))}
    </div>
  );
};
const AccountList = ({ accounts, connectedAccount, accountConnectHandler }) => {
  return (
    <div>
      {Object.values(accounts).map((signingAccount) => (
        // ToDo: add an account connect modal
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <div onClick={() => accountConnectHandler(signingAccount)}>
            {`${signingAccount.account.address}`}
          </div>
          <div>
            {`${
              connectedAccount?.address === signingAccount?.address
                ? 'connected'
                : 'disconnected'
            }`}
          </div>
        </div>
      ))}
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

  const initialView: ConnectViews =
    walletsAccounts && Object.keys(walletsAccounts).length > 0
      ? 'accounts'
      : 'wallets';
  const toggleView = () => {
    console.log(currentView);
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
    console.log('initiate');
    setCurrentView(initialView);
  }, [initialView]);
  return (
    <>
      <Button color="secondary" onPress={() => openModal()}>
        Connect
      </Button>
      <Modal visible={visible} onClose={() => closeModal()}>
        <div onClick={() => toggleView()}>{`${
          currentView === 'accounts' ? 'wallets' : 'accounts'
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
