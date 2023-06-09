import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';
import { useAppLifeCycle } from 'src/lifecycle';

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
  const { updater } = useAppLifeCycle();
  const btnTitle = name || address;
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <Identicon
        value={address}
        theme="polkadot"
        size={size || 18}
        onCopy={() =>
          updater.addReport({
            type: 'Info',
            message: 'Address copied to clipboard!',
          })
        }
      />
      <div className={`${textClassName || ''}`}>
        {stringShorten(btnTitle, 5)}
      </div>
    </div>
  );
}
