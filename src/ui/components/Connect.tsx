import { useEffect, useState } from 'react';
import { BaseWallet } from '@polkadot-onboard/core';
import Identicon from '@polkadot/react-identicon';
import { Button, Modal } from '../lib/index.js';
import { useAccount, useWallets } from '../../contexts/index.js';
import type { SigningAccount } from '../../contexts/Account.js';
import { WalletState } from '../../contexts/Wallets.js';
import Account from './Account.js';
import Wallet from './Wallet.js';

export interface IWalletsListProps {
  wallets: Array<BaseWallet>;
  walletState: Map<string, WalletState>;
  walletConnectHandler: (wallet: BaseWallet) => void;
}

const WalletsList = ({
  wallets,
  walletState,
  walletConnectHandler,
}: IWalletsListProps) => {
  return (
    <div>
      {wallets?.map((wallet, index) => {
        const name = wallet?.metadata.title;
        const iconUrl = wallet?.metadata.iconUrl;
        const state = walletState.get(wallet?.metadata.title) || 'disconnected';
        return (
          <Wallet
            key={index}
            name={name}
            state={state}
            clickHandler={() => walletConnectHandler(wallet)}
            iconUrl={iconUrl}
          />
        );
      })}
    </div>
  );
};

export interface IAccountListProps {
  accounts: Map<string, SigningAccount>;
  connectedAccount: SigningAccount | undefined;
  accountConnectHandler: (account: SigningAccount) => void;
}

const AccountList = ({
  accounts,
  connectedAccount,
  accountConnectHandler,
}: IAccountListProps) => {
  return (
    <div>
      {[...accounts.entries()].map(([key, signingAccount]) => {
        const { account } = signingAccount;
        const isConnected =
          !!connectedAccount &&
          connectedAccount.account.address === account.address;
        return (
          <Account
            key={key}
            name={account.name || ''}
            address={account.address}
            state={{ isConnected }}
            clickHandler={() => accountConnectHandler(signingAccount)}
          />
        );
      })}
    </div>
  );
};

type ConnectViews = 'wallets' | 'accounts';

export const ConnectButton = () => {
  const [visible, setVisible] = useState(false);
  const [currentView, setCurrentView] = useState<ConnectViews>();
  const { wallets, walletState, setWalletState } = useWallets();
  const { connectedAccount, setConnectedAccount, walletsAccounts } =
    useAccount();

  const loadedAccountsCount = walletsAccounts ? walletsAccounts.size : 0;

  const initialView: ConnectViews =
    loadedAccountsCount > 0 ? 'accounts' : 'wallets';

  const toggleView = () => {
    setCurrentView((oldView) =>
      oldView === 'wallets' ? 'accounts' : 'wallets'
    );
  };

  const walletConnectHandler = async (wallet: BaseWallet) => {
    if (walletState.get(wallet?.metadata.title) == 'connected') {
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

  const btnClickHandler = () => openModal();
  const { name, address } = connectedAccount?.account || {};
  const btnTitle = connectedAccount?.account ? name || address : 'Connect';

  return (
    <>
      <Button onClick={btnClickHandler}>
        <div className="flex flex-nowrap items-center gap-1">
          {address && <Identicon value={address} theme="polkadot" size={18} />}
          <div className="text-sm">{btnTitle}</div>
        </div>
      </Button>
      <Modal open={visible} onClose={() => closeModal()}>
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
