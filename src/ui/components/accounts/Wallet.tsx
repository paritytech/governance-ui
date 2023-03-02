import { WalletState } from '../../../contexts/Wallets.js';
import { ConnectCard } from './ConnectCard.js';

export interface IWalletProps {
  name: string;
  state: WalletState;
  iconUrl?: string;
  clickHandler: () => void;
}

const Wallet = ({ name, state, iconUrl, clickHandler }: IWalletProps) => {
  const isConnected = state === 'connected';
  return (
    <ConnectCard
      className="flex flex-nowrap gap-2 p-2"
      onClick={() => clickHandler()}
    >
      <div className=" flex items-center justify-center">
        {iconUrl ? <img src={iconUrl} /> : null}
      </div>
      <div className="flex-auto">
        <div>{name}</div>
      </div>
      <div>{isConnected ? 'connected' : 'not connected'}</div>
    </ConnectCard>
  );
};

export default Wallet;
