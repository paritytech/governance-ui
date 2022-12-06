import { BaseWallet } from '@polkadot-onboard/core';
import React, { useState } from 'react';
import { useWallets } from '../contexts/Wallets';
import { Button, Modal } from './common';

class ConnectStorage {
  static getConnectStorageKey(wallet: BaseWallet) {
    return `wallet#${wallet.metadata.title}`;
  }
  static setConnected(wallet: BaseWallet) {
    let sKey = this.getConnectStorageKey(wallet);
    localStorage.setItem(sKey, 'connected');
  }
  static removeConnected(wallet: BaseWallet) {
    let sKey = this.getConnectStorageKey(wallet);
    localStorage.removeItem(sKey);
  }
  static isConnected(wallet: BaseWallet) {
    let sKey = this.getConnectStorageKey(wallet);
    let walletState = localStorage.getItem(sKey);
    return walletState == 'connected';
  }
}
const ConnectModal = () => {
  const [visible, setVisible] = useState(false);
  const closeHandler = () => setVisible(false);
  const connectHandler = async (wallet: BaseWallet) => {
    if (ConnectStorage.isConnected(wallet)) {
      await wallet.disconnect();
      ConnectStorage.removeConnected(wallet);
    } else {
      await wallet.connect();
      ConnectStorage.setConnected(wallet);
      const accounts = await wallet.getAccounts();
      console.log(wallet.metadata.title);
      console.log(accounts);
    }
  };
  const { wallets } = useWallets();
  return (
    <>
      <Button color="secondary" onPress={() => setVisible(true)}>
        Connect
      </Button>
      <Modal visible={visible} onClose={closeHandler}>
        {wallets?.map((wallet) => (
          // ToDo: add an account connect modal
          <div onClick={() => connectHandler(wallet)}>
            {`${wallet?.metadata?.title}`}
          </div>
        ))}
      </Modal>
    </>
  );
};

export default ConnectModal;
