import { WalletState } from '../contexts/Wallets.js';

export interface IWalletProps {
  name: string;
  state: WalletState;
  iconUrl?: string;
  clickHandler: () => void;
}

const Wallet = ({ name, state, iconUrl, clickHandler }: IWalletProps) => {
  const isConnected = state === 'connected';
  return (
    <div
      className="my-1 flex flex-nowrap rounded-lg border-2 border-solid"
      onClick={() => clickHandler()}
    >
      <div className="m-1 flex items-center justify-center">
        {iconUrl ? <img src={iconUrl} /> : null}
      </div>
      <div className="m-1 flex-auto">
        <div>{name}</div>
      </div>
      <div className="m-1">{isConnected ? 'connected' : 'not connected'}</div>
    </div>
  );
};

export default Wallet;
