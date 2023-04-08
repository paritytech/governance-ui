import { memo } from 'react';
import { TrackMetaData } from 'src/lifecycle';

export function LabeledBox({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="text-sm">{title}</div>
        <div className="flex gap-2 text-base font-medium">{children}</div>
      </div>
    </>
  );
}

export const TracksLabeledBox = memo(function ({
  title,
  tracks,
  visibleCount,
}: {
  title: string;
  tracks: TrackMetaData[];
  visibleCount: number;
}) {
  const tracksCaption = tracks
    .slice(0, visibleCount)
    .map((track) => track.title)
    .join(', ');
  const remainingCount = Math.max(tracks.length - visibleCount, 0);
  return (
    <LabeledBox className="col-span-2" title={title}>
      <div>
        {tracksCaption}
        {!!remainingCount && (
          <>
            {' and'} <a>{`${remainingCount} more`}</a>
          </>
        )}
      </div>
    </LabeledBox>
  );
});
