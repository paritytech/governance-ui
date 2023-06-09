import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';
import { useState } from 'react';

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
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="flex cursor-pointer flex-nowrap items-center gap-2"
      onClick={() => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <Identicon
        style={{ cursor: 'unset' }}
        value={address}
        theme="polkadot"
        size={size || 18}
      />
      {copied ? (
        <div className={`${textClassName || ''}`}>Copied to clipboard!</div>
      ) : (
        <div className={`${textClassName || ''}`}>
          {stringShorten(btnTitle, 5)}
        </div>
      )}
    </div>
  );
}
