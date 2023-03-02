import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';
import { ConnectCard } from './ConnectCard';

export interface AccountProps {
  name: string;
  address: string;
  clickHandler: () => void;
  state: { isConnected: boolean };
}

const Account = ({ name, address, clickHandler, state }: AccountProps) => {
  const { isConnected } = state;
  return (
    <ConnectCard
      className="flex flex-nowrap p-1"
      onClick={() => clickHandler()}
    >
      <div className="m-1 flex items-center justify-center">
        <Identicon value={address} theme="polkadot" size={24} />
      </div>
      <div className="m-1 flex flex-auto flex-col text-xs">
        <div>{stringShorten(name, 10)}</div>
        <div>{stringShorten(address, 10)}</div>
      </div>
      <div className="m-1">{isConnected ? 'connected' : ''}</div>
    </ConnectCard>
  );
};

export default Account;
