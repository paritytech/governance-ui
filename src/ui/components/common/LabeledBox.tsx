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

export const TracksLabel = memo(function ({
  allTracksCount,
  tracks,
  visibleCount,
}: {
  allTracksCount: number | undefined;
  tracks: TrackMetaData[];
  visibleCount: number;
}) {
  const tracksCaption = tracks
    .slice(0, visibleCount)
    .map((track) => track.title)
    .join(', ');
  const remainingCount = Math.max(tracks.length - visibleCount, 0);
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
