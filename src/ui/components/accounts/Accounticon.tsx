import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';

export function Accounticon({
  address,
  name,
  size,
  textClassName,
}: {
  address: string;
  name?: string;
  size?: number;
  textClassName?: string;
}) {
  const btnTitle = name || address;
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <Identicon
        style={{ cursor: 'unset' }}
        value={address}
        theme="polkadot"
        size={size || 18}
      />
      <div className={`${textClassName || ''}`}>
        {stringShorten(btnTitle, 5)}
      </div>
    </div>
  );
}
