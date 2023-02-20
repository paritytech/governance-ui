import { Card } from '../lib';

export function CheckBox({ title }) {
  const checkboxId = `${title}-checkbox`;
  return (
    <div className="flex items-center">
      <input
        id={checkboxId}
        type="checkbox"
        value=""
        className="h-4 w-4 rounded-lg border border-primary bg-gray-100 accent-primary"
      />
      <label
        htmlFor={checkboxId}
        className="ml-2 text-sm font-semibold text-gray-900"
      >
        {title}
      </label>
    </div>
  );
}
export function TrackCheckableCard({ track, expanded }) {
  return (
    <Card>
      <div className={`flex flex-col gap-2 ${expanded ? 'p-4' : 'p-2'}`}>
        <CheckBox title={track.title} />
        {expanded && (
          <div className="text-sm leading-tight">{track.description}</div>
        )}
      </div>
    </Card>
  );
}

export function TrackSelect({ tracks, className, expanded }) {
  return (
    <div
      className={`flex w-full flex-col justify-between md:flex-row ${className}`}
    >
      {tracks.map((track, idx) => (
        <div
          key={idx}
          className=" flex w-full flex-col gap-2 border-b md:w-1/4"
        >
          <div className="border-b px-2 uppercase">{track.title}</div>
          <div className="flex flex-col">
            {track.subtracks.map((subtrack, idx) => (
              <TrackCheckableCard
                key={idx}
                track={subtrack}
                expanded={expanded}
              />
            ))}
          </div>
        </div>
      ))}{' '}
    </div>
  );
}
