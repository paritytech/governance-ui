import type { TrackType } from './types';
import { tracksMetadata } from '../../../chain/mocks';
import { useDelegation } from '../../../contexts/Delegation';
import { Card } from '../../lib';

interface ICheckBoxProps {
  title?: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  background?: boolean;
}
export function CheckBox({
  title,
  checked,
  onChange,
  background,
}: ICheckBoxProps) {
  const checkboxId = `${title}-checkbox`;
  return (
    <div
      className={`flex items-center rounded-md ${
        background ? `border border-gray-300 bg-gray-200 px-4 py-2` : ''
      } `}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
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

interface ITrackCheckableCardProps {
  track?: TrackType;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  expanded?: boolean;
}

export function TrackCheckableCard({
  track,
  checked,
  onChange,
  expanded,
}: ITrackCheckableCardProps) {
  return (
    <Card>
      <div className={`flex flex-col gap-2 ${expanded ? 'p-4' : 'p-2'}`}>
        <CheckBox title={track?.title} checked={checked} onChange={onChange} />
        {expanded && (
          <div className="text-sm leading-tight">{track?.description}</div>
        )}
      </div>
    </Card>
  );
}

interface ITrackSelectProps {
  className?: string;
  expanded?: boolean;
}
export function TrackSelect({ className, expanded }: ITrackSelectProps) {
  const availableTracks = tracksMetadata;
  const { selectedTracks, setTrackSelection } = useDelegation();
  return (
    <div
      className={`flex w-full flex-col justify-between md:flex-row md:gap-4 ${className}`}
    >
      {availableTracks.map((track, idx) => (
        <div key={idx} className=" flex w-full flex-col gap-2 md:w-1/4">
          <div className="px-2 text-sm">{track.title}</div>
          <div className="flex flex-col gap-4">
            {track.subtracks.map((subtrack, idx) => (
              <TrackCheckableCard
                key={idx}
                track={subtrack}
                checked={selectedTracks.has(subtrack.id)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setTrackSelection(subtrack.id, isChecked);
                }}
                expanded={expanded}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
