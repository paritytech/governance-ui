import { BaseWallet } from '@polkadot-onboard/core';
import { WalletState } from '../../../contexts/Wallets.js';
import Wallet from './Wallet.js';
import { capitalizeFirstLetter } from 'src/utils/string.js';

interface IWalletsListProps {
  wallets: Array<BaseWallet>;
  walletState: Map<string, WalletState>;
  walletConnectHandler: (wallet: BaseWallet) => void;
}

export const WalletsList = ({
  wallets,
  walletState,
  walletConnectHandler,
}: IWalletsListProps) => {
  return (
    <div className="my-2 flex flex-col gap-2">
      {wallets?.map((wallet, index) => {
        const name = capitalizeFirstLetter(wallet?.metadata.title);
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
