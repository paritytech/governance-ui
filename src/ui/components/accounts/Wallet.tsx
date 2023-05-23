import { WalletState } from '../../../contexts/Wallets.js';
import { ConnectCard } from './ConnectCard.js';
import { AddIcon, ConnectedIcon } from '../../icons/index.js';

export interface IWalletProps {
  name: string;
  state: WalletState;
  iconUrl?: string;
  clickHandler: () => void;
}

const Wallet = ({ name, state, iconUrl, clickHandler }: IWalletProps) => {
  const isConnected = state === 'connected';
  return (
    <ConnectCard className="flex flex-nowrap gap-2 p-2 ">
      <div className=" flex items-center justify-center">
        {iconUrl ? <img src={iconUrl} /> : null}
      </div>
      <div className="flex-auto">
        <div>{name}</div>
      </div>
      <div
        onClick={clickHandler}
        className="flex min-w-[1.5rem] cursor-pointer items-center justify-center"
      >
        {isConnected ? (
          <div className="text-[0.5rem] text-green-500">
            <ConnectedIcon />
          </div>
        ) : (
          <div className="text-gray-500">
            <AddIcon />
          </div>
        )}
      </div>
    </ConnectCard>
  );
};

export default Wallet;
