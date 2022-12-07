import { BaseWallet } from '@polkadot-onboard/core';
import React, { useState } from 'react';
import { useAccount } from '../contexts/Account';
import type { SigningAccount } from '../contexts/Account';
import { useWallets } from '../contexts/Wallets';
import { Button, Modal } from './common';
const WalletsList = () => {
  const { wallets, walletState, setWalletState } = useWallets();
  const connectHandler = async (wallet: BaseWallet) => {
    if (walletState[wallet?.metadata.title] == 'connected') {
      await wallet.disconnect();
      setWalletState(wallet?.metadata.title, 'disconnected');
    } else {
      await wallet.connect();
      setWalletState(wallet?.metadata.title, 'connected');
    }
  };
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
          <div onClick={() => connectHandler(wallet)}>
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
const AccountList = () => {
  const { connectedAccount, setConnectedAccount, walletsAccounts } =
    useAccount();
  const connectHandler = async (signingAccount: SigningAccount) => {
    setConnectedAccount(signingAccount);
  };
  console.log(walletsAccounts);
  return (
    <div>
      {Object.values(walletsAccounts).map((signingAccount) => (
        // ToDo: add an account connect modal
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <div onClick={() => connectHandler(signingAccount)}>
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

const ConnectModal = () => {
  const [visible, setVisible] = useState(false);
  const { walletsAccounts } = useAccount();
  console.log(walletsAccounts);
  const closeHandler = () => setVisible(false);

  return (
    <>
      <Button color="secondary" onPress={() => setVisible(true)}>
        Connect
      </Button>
      <Modal visible={visible} onClose={closeHandler}>
        {walletsAccounts && Object.keys(walletsAccounts).length > 0 ? (
          <AccountList />
        ) : (
          <WalletsList />
        )}
      </Modal>
    </>
  );
};

export default ConnectModal;
