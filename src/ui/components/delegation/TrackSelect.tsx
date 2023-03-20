import type { TrackType } from './types';
import { tracksMetadata } from '../../../chain/mocks';
import { useDelegation } from '../../../contexts/Delegation.js';
import { ButtonSecondary, Card } from '../../lib';
import { CheckIcon, ChevronDownIcon } from '../../icons';
import SectionTitle from '../SectionTitle';
import ProgressStepper from '../ProgressStepper';
import { ReferendumDetails, ReferendumOngoing } from '../../../types';
import { Accounticon } from '../accounts/Accounticon';

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
        className="hidden h-4 w-4 rounded-lg border border-primary bg-gray-100 accent-primary"
      />
      <label
        htmlFor={checkboxId}
        className="flex items-center gap-2 text-sm font-semibold text-gray-900"
      >
        <div
          className={`flex h-4 w-4 rounded-sm border-[1px] p-[1px] ${
            checked
              ? 'border-primary bg-primary hover:brightness-95'
              : 'border-gray-500  bg-white hover:brightness-95'
          }`}
        >
          <CheckIcon
            className={`h-full w-full ${
              checked ? 'block' : 'hidden'
            } text-white`}
          />
        </div>
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </label>
    </div>
  );
}

interface ITrackCheckableCardProps {
  track?: TrackType;
  referenda: Map<number, ReferendumOngoing>;
  details: Map<number, ReferendumDetails>;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  expanded?: boolean;
}

function referendaTitle(
  index: number,
  details: Map<number, ReferendumDetails>
): string {
  const detail = details.get(index);
  const base = `# ${index}`;
  if (detail) {
    return `${base} - ${detail.title}`;
  } else {
    return base;
  }
}

function ReferendaLinks({ index }: { index: number }): JSX.Element {
  return (
    <div>
      <a href={`https://kusama.polkassembly.io/referenda/${index}`}>P</a>
    </div>
  );
}

function ReferendaDetails({
  index,
  details,
  referendum,
}: {
  index: number;
  details: Map<number, ReferendumDetails>;
  referendum: ReferendumOngoing;
}): JSX.Element {
  return (
    <div className="rounded-2xl border-2 border-solid border-gray-100 p-5">
      <div className="flex flex-row">
        <div className="text-sm leading-tight">
          {referendaTitle(index, details)}
        </div>
        <ReferendaLinks index={index} />
      </div>
      <div className="flex flex-row pt-5">
        <Accounticon
          textClassName="font-medium"
          address={referendum.submissionDeposit.who}
          size={24}
        />
        <div className="text-sm leading-tight">
          {referendum.tally.ayes.toString()}
        </div>
      </div>
    </div>
  );
}

function NoActiveReferendum(): JSX.Element {
  return <div>No active referendum</div>;
}

export function TrackCheckableCard({
  track,
  referenda,
  details,
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
        {referenda.size ? (
          Array.from(referenda.entries()).map(([index, referendum]) => (
            <ReferendaDetails
              key={index}
              index={index}
              details={details}
              referendum={referendum}
            />
          ))
        ) : (
          <NoActiveReferendum />
        )}
      </div>
    </Card>
  );
}

function filterReferendaForTrack(
  trackIndex: number,
  referenda: Map<number, ReferendumOngoing>
): Map<number, ReferendumOngoing> {
  return new Map(
    Array.from(referenda.entries()).filter(
      ([, referendum]) => referendum.trackIndex == trackIndex
    )
  );
}

interface ITrackSelectProps {
  className?: string;
  referenda: Map<number, ReferendumOngoing>;
  details: Map<number, ReferendumDetails>;
  expanded?: boolean;
  delegateHandler?: () => void;
}
export function TrackSelect({
  className,
  referenda,
  details,
  expanded,
  delegateHandler,
}: ITrackSelectProps) {
  const availableTracks = tracksMetadata;
  const { selectedTracks, setTrackSelection } = useDelegation();

  return (
    <div className="flex flex-col gap-12 px-3 lg:px-8 lg:pb-12">
      <SectionTitle
        title="Delegate by Track"
        description="Select the tracks you&lsquo;d like to delegate."
        step={0}
      >
        <ProgressStepper step={0} />
      </SectionTitle>
      <div className="flex flex-col gap-2 lg:gap-4">
        <div className="mb-4 flex flex-row justify-between">
          <CheckBox
            background
            title="All tracks"
            checked={selectedTracks.size > 0 ? true : false}
            // how do i check number of available tracks?
            onChange={(e) => {
              const isChecked = e.target.checked;
              availableTracks.map((track) => {
                track.subtracks.map((subtracks) => {
                  setTrackSelection(subtracks.id, isChecked);
                });
              });
            }}
          />
          <ButtonSecondary
            onClick={() => (delegateHandler ? delegateHandler() : null)}
          >
            <div className="flex flex-row items-center justify-center gap-1">
              <div>
                {selectedTracks.size > 0
                  ? 'Delegate Tracks'
                  : 'Check delegates first'}
              </div>
              <ChevronDownIcon />
            </div>
          </ButtonSecondary>
        </div>
        <div
          className={`flex w-full flex-col justify-between md:flex-row md:gap-4 ${className}`}
        >
          {availableTracks.map((track, idx) => (
            <div key={idx} className="flex w-full flex-col gap-2 md:w-1/4">
              <div className="text-sm">{track.title}</div>
              <div className="mb-8 flex flex-col gap-2 lg:gap-4">
                {track.subtracks.map((subtrack, idx) => (
                  <TrackCheckableCard
                    key={idx}
                    track={subtrack}
                    details={details}
                    referenda={filterReferendaForTrack(subtrack.id, referenda)}
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
      </div>
    </div>
  );
}
