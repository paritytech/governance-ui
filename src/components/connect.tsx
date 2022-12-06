import { BaseWallet } from '@polkadot-onboard/core';
import React, { useState } from 'react';
import { WalletStateStorage, useWallets } from '../contexts/Wallets';
import { Button, Modal } from './common';

const ConnectModal = () => {
  const [visible, setVisible] = useState(false);
  const { wallets } = useWallets();
  const closeHandler = () => setVisible(false);
  const connectHandler = async (wallet: BaseWallet) => {
    if (WalletStateStorage.isConnected(wallet)) {
      await wallet.disconnect();
      WalletStateStorage.removeConnected(wallet);
    } else {
      await wallet.connect();
      WalletStateStorage.setConnected(wallet);
      console.log(wallet.metadata.title);
    }
  };

  return (
    <>
      <Button color="secondary" onPress={() => setVisible(true)}>
        Connect
      </Button>
      <Modal visible={visible} onClose={closeHandler}>
        {wallets?.map((wallet) => (
          // ToDo: add an account connect modal
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <div onClick={() => connectHandler(wallet)}>
              {`${wallet?.metadata?.title}`}
            </div>
            <div>
              {`${
                WalletStateStorage.isConnected(wallet)
                  ? 'connected'
                  : 'disconnected'
              }`}
            </div>
          </div>
        ))}
      </Modal>
    </>
  );
};

export default ConnectModal;
