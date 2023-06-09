import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';
import { ConnectedIcon, DisconnectIcon } from '../../icons';
import { ConnectCard } from './ConnectCard.js';

const Account = ({
  name,
  address,
  clickHandler,
  state,
}: {
  name: string;
  address: string;
  clickHandler: () => void;
  state?: { isConnected: boolean };
}) => {
  const { isConnected } = state || {};
  return (
    <ConnectCard
      onClick={clickHandler}
      className="flex cursor-pointer flex-nowrap p-1"
    >
      <div className="m-1 flex items-center justify-center">
        <Identicon
          style={{ cursor: 'unset' }}
          value={address}
          theme="polkadot"
          size={32}
        />
      </div>
      <div className="m-1 flex flex-auto flex-col text-xs">
        <div className="uppercase ">{name}</div>
        <div>{stringShorten(address, 10)}</div>
      </div>
      {isConnected ? (
        <div className="nowrap m-1 flex flex-row items-center justify-center gap-1 text-xs text-primary">
          <div>Disconnect</div>
          <DisconnectIcon />
        </div>
      ) : (
        <div className="nowrap m-1 flex flex-row items-center justify-center gap-1 text-xs text-secondary">
          <div>Connect</div>
          <ConnectedIcon />
        </div>
      )}
    </ConnectCard>
  );
};

export default Account;
