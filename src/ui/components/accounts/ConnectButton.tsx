import type { SigningAccount } from '../../../types';

import { useEffect, useState } from 'react';
import { BaseWallet } from '@polkadot-onboard/core';
import Identicon from '@polkadot/react-identicon';
import { Button, Modal } from '../../lib/index.js';
import { useAccount, useWallets } from '../../../contexts/index.js';

import { AccountList } from './AccountList.js';
import { WalletsList } from './WalletList.js';
import { ConnectCard } from './ConnectCard.js';
import { ChevronRightIcon, WalletIcon } from '../../icons/index.js';
import { extractChainInfo, useAppLifeCycle } from '../../../lifecycle';

type ConnectViews = 'wallets' | 'accounts';

const WalletView = ({
  gotoAccountsView,
  walletConnectHandler,
}: {
  gotoAccountsView: () => void;
  walletConnectHandler: (wallet: BaseWallet) => Promise<void>;
}) => {
  const { wallets, walletState } = useWallets();
  const { walletsAccounts } = useAccount();
  const loadedAccountsCount = walletsAccounts ? walletsAccounts.size : 0;
  return (
    <>
      <div className="flex flex-col items-start gap-4 border-b">
        <div className="font-brand font-semibold">Wallet</div>

        <ConnectCard className="my-2 flex w-full flex-row items-center justify-between p-2">
          <div>{`${loadedAccountsCount} Imported Accounts`}</div>
          <div onClick={gotoAccountsView}>
            <ChevronRightIcon className="cursor-pointer" />
          </div>
        </ConnectCard>
      </div>
      <WalletsList
        wallets={wallets}
        walletState={walletState}
        walletConnectHandler={walletConnectHandler}
      />
    </>
  );
};

const AccountView = ({
  gotoWalletsView,
  accountConnectHandler,
}: {
  gotoWalletsView: () => void;
  accountConnectHandler: (
    signingAccount: SigningAccount | undefined
  ) => Promise<void>;
}) => {
  const { state } = useAppLifeCycle();
  const { ss58 } = extractChainInfo(state) || {};
  const { connectedAccount, walletsAccounts } = useAccount();
  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <div className="font-brand uppercase">Accounts</div>
        <div
          className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-2xl border border-solid px-4 py-1 "
          onClick={() => gotoWalletsView()}
        >
          <WalletIcon />
          <div className="text-xs font-semibold">Wallets</div>
        </div>
      </div>
      <AccountList
        accounts={walletsAccounts}
        connectedAccount={connectedAccount}
        accountConnectHandler={accountConnectHandler}
        ss58Format={ss58}
      />
    </>
  );
};

export const ConnectButton = () => {
  const [visible, setVisible] = useState(false);
  const [currentView, setCurrentView] = useState<ConnectViews>();
  const { walletState, setWalletState } = useWallets();
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

  const accountConnectHandler = async (
    signingAccount: SigningAccount | undefined
  ) => {
    setConnectedAccount(signingAccount);
    closeModal();
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
          {address && (
            <Identicon
              style={{ cursor: 'unset' }}
              value={address}
              theme="polkadot"
              size={18}
            />
          )}
          <div className="text-sm">{btnTitle}</div>
        </div>
      </Button>
      <Modal open={visible} onClose={() => closeModal()}>
        <div className="flex max-h-[90vh] flex-col px-1 py-2">
          {currentView === 'accounts' ? (
            <AccountView
              gotoWalletsView={() => toggleView()}
              accountConnectHandler={accountConnectHandler}
            />
          ) : (
            <WalletView
              gotoAccountsView={() => toggleView()}
              walletConnectHandler={walletConnectHandler}
            />
          )}
        </div>
      </Modal>
    </>
  );
};
