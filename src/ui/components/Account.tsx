import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';

export interface AccountProps {
  name: string;
  address: string;
  clickHandler: () => void;
  state: { isConnected: boolean };
}

const Account = ({ name, address, clickHandler, state }: AccountProps) => {
  const { isConnected } = state;
  return (
    <div
      className="mx-1 flex flex-nowrap rounded-lg border border-solid"
      onClick={() => clickHandler()}
    >
      <div className="m-1 flex items-center justify-center">
        <Identicon value={address} theme="polkadot" size={32} />
      </div>
      <div className="m-1 flex flex-auto flex-col">
        <div>{stringShorten(name, 10)}</div>
        <div>{stringShorten(address, 10)}</div>
      </div>
      <div className="m-1">{isConnected ? 'connected' : ''}</div>
    </div>
  );
};

export default Account;
