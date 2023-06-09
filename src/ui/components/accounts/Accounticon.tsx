import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';
import { useAppLifeCycle } from 'src/lifecycle';

export function Accounticon({
  address,
  name,
  size,
  textClassName,
  copy = false,
}: {
  address: string;
  name?: string;
  size?: number;
  textClassName?: string;
  copy?: boolean;
}) {
  const { updater } = useAppLifeCycle();
  const btnTitle = name || address;
  const style = !copy ? { cursor: 'unset' } : undefined;
  const onCopy = () => {
    updater.addReport({
      type: 'Info',
      message: 'Address copied to clipboard!',
    });
  };
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <div>
        <Identicon
          style={style}
          value={address}
          theme="polkadot"
          size={size || 18}
          onCopy={copy ? onCopy : undefined}
        />
      </div>
      <div className={`${textClassName || ''}`}>
        {stringShorten(btnTitle, 5)}
      </div>
    </div>
  );
}
