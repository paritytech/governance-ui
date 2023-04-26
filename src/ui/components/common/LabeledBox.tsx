import { memo } from 'react';
import { TrackMetaData } from '../../../lifecycle';
import Tooltip from '../Tooltip';
import { formatBalance } from '../../../utils/polkadot-api';
import BN from 'bn.js';

export function LabeledBox({
  title,
  children,
  className,
  tooltipContent,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  tooltipContent?: JSX.Element;
}) {
  return (
    <>
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex gap-3">
          <div className="text-sm">{title}</div>
          {tooltipContent && <Tooltip content={tooltipContent} title={title} />}
        </div>
        <div className="flex gap-2 text-base font-medium">{children}</div>
      </div>
    </>
  );
}

export const TracksLabel = memo(function ({
  allTracksCount,
  tracks,
  visibleCount,
}: {
  allTracksCount?: number;
  tracks: TrackMetaData[];
  visibleCount?: number;
}) {
  const tracksCaption = tracks
    .slice(0, visibleCount)
    .map((track) => track.title)
    .join(', ');
  const remainingCount =
    visibleCount !== undefined ? Math.max(tracks.length - visibleCount, 0) : 0;
  return (
    <>
      {allTracksCount && allTracksCount === tracks.length ? (
        <div>All tracks</div>
      ) : (
        <div>
          {tracksCaption}
          {!!remainingCount && (
            <>
              {' and'} <a>{`${remainingCount} more`}</a>
            </>
          )}
        </div>
      )}
    </>
  );
});

export function BalanceLabel({
  balance,
  decimals,
  unit,
}: {
  balance?: BN;
  decimals?: number;
  unit?: string;
}): JSX.Element {
  if (balance && unit && decimals) {
    return <>{formatBalance(balance, decimals, unit)}</>;
  }
  return <>...</>;
}
