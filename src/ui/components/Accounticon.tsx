import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';

type PropsType = {
  address: string;
  name?: string;
  size?: number;
  textClassName?: string;
};
export function Accounticon({ address, name, size, textClassName }: PropsType) {
  const btnTitle = name || address;
  return (
    <div className="flex flex-nowrap items-center gap-1">
      <Identicon value={address} theme="polkadot" size={size || 18} />
      <div className={`${textClassName || ''}`}>
        {stringShorten(btnTitle, 5)}
      </div>
    </div>
  );
}
