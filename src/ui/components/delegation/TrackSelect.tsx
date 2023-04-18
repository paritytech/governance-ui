import type { Tally, VotingDelegating } from '../../../types';

import { memo, useState } from 'react';
import { useDelegation } from '../../../contexts/Delegation.js';
import { Button, Card } from '../../lib';
import { ChevronDownIcon } from '../../icons';
import SectionTitle from '../SectionTitle';
import ProgressStepper from '../ProgressStepper';
import { ReferendumDetails, ReferendumOngoing } from '../../../types';
import { Accounticon } from '../accounts/Accounticon';
import { Network } from '../../../network';
import { CloseIcon } from '../../icons';
import { UndelegateModal } from './delegateModal/Undelegate';
import { InnerCard } from '../common/InnerCard';
import { useAccount } from '../../../contexts';
import {
  useAppLifeCycle,
  extractDelegations,
  TrackMetaData,
  TrackCategory,
  flattenAllTracks,
  filterUndelegatedTracks,
  extractIsProcessing,
  extractDelegatedTracks,
} from '../../../lifecycle';
import { CheckBox } from '../CheckBox';

interface ITrackCheckableCardProps {
  track: TrackMetaData;
  referenda: Map<number, ReferendumOngoing>;
  details: Map<number, ReferendumDetails>;
  delegation: VotingDelegating | undefined;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  network: Network;
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

function ReferendaLinkIcon({
  index,
  network,
}: {
  index: number;
  network: Network;
}) {
  return (
    <a
      href={`https://${network.toLowerCase()}.polkassembly.io/referenda/${index}`}
    >
      <img src="data:image/png;base64,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" />
    </a>
  );
}

const TallyBadgeBox = memo(function ({ tally }: { tally: Tally }) {
  const { ayes, nays } = tally;
  const total = ayes.add(nays);

  // if total===0 means no vote is casted
  const ayePerc = !total.eqn(0) ? ayes.muln(100).div(total).toNumber() : 0;
  const nayPerc = !total.eqn(0) ? 100 - ayePerc : 0;

  const ayeClass =
    ayePerc > nayPerc ? 'rounded bg-green-500 text-white' : 'text-green-500';
  const nayClass =
    nayPerc > ayePerc ? 'rounded bg-red-500 text-white' : 'text-red-500';
  return (
    <div className="flex flex-row gap-1 text-sm font-semibold">
      <div
        className={`p-1 text-center align-middle ${ayeClass}`}
      >{`${ayePerc}%`}</div>
      <div
        className={`p-1 text-center align-middle ${nayClass}`}
      >{`${nayPerc}%`}</div>
    </div>
  );
});

function ReferendaDetails({
  index,
  details,
  referendum,
  network,
}: {
  index: number;
  details: Map<number, ReferendumDetails>;
  referendum: ReferendumOngoing;
  network: Network;
}) {
  return (
    <InnerCard className="gap-2 border-2 border-solid border-gray-100 text-body-2 font-medium">
      <div className="flex flex-row gap-2">
        <div className="grow overflow-hidden text-ellipsis leading-tight">
          {referendaTitle(index, details)}
        </div>
        <div className="w-[20px] flex-none">
          <ReferendaLinkIcon index={index} network={network} />
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <Accounticon address={referendum.submissionDeposit.who} size={24} />
        <TallyBadgeBox tally={referendum.tally} />
      </div>
    </InnerCard>
  );
}

function TrackDelegation({
  track,
  delegation,
}: {
  track: TrackMetaData;
  delegation: VotingDelegating;
}) {
  const { state } = useAppLifeCycle();
  const isProcessing = extractIsProcessing(state);
  const { target } = delegation;
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
  };
  const openModal = () => {
    setShowModal(true);
  };
  return (
    <>
      <InnerCard className="gap-2 bg-[#FFE4F3]">
        <div className="text-sm font-normal">Delegated to</div>
        <div className="flex flex-row items-center justify-between">
          <Accounticon
            textClassName="font-semibold text-base"
            address={target}
            size={24}
          />
          <div
            className={`${
              !isProcessing
                ? 'cursor-pointer hover:scale-[1.01]'
                : 'text-fg-disabled'
            }`}
            onClick={() => !isProcessing && openModal()}
          >
            <CloseIcon />
          </div>
        </div>
      </InnerCard>
      <UndelegateModal
        onClose={closeModal}
        open={showModal}
        tracks={(track && [track]) || []}
        address={delegation.target}
      />
    </>
  );
}

function NoActiveReferendum() {
  return (
    <div className="text-body-2 text-fg-disabled">No active referendum</div>
  );
}

export function TrackCheckableCard({
  track,
  referenda,
  details,
  delegation,
  checked,
  onChange,
  network,
}: ITrackCheckableCardProps) {
  const { state } = useAppLifeCycle();
  const isProcessing = extractIsProcessing(state);
  const disabled = !!delegation || isProcessing;
  return (
    <Card>
      <div className={`flex flex-col gap-2 p-2`}>
        <div className="mb-4 flex flex-col gap-2">
          <CheckBox
            title={track?.title}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
          />
          <div
            className={`${
              disabled ? 'text-fg-disabled' : ''
            } text-body-2 leading-tight`}
          >
            {track?.description}
          </div>
          {delegation && (
            <TrackDelegation track={track} delegation={delegation} />
          )}
        </div>
        {referenda.size ? (
          Array.from(referenda.entries()).map(([index, referendum]) => (
            <ReferendaDetails
              key={index}
              index={index}
              details={details}
              referendum={referendum}
              network={network}
            />
          ))
        ) : (
          <NoActiveReferendum />
        )}
      </div>
    </Card>
  );
}

function partitionReferendaByTrack(
  referenda: Map<number, ReferendumOngoing>
): Map<number, Map<number, ReferendumOngoing>> {
  return Array.from(referenda.entries()).reduce((acc, [id, referendum]) => {
    const trackId = referendum.trackIndex;
    const tracks = acc.get(trackId) || new Map<number, ReferendumOngoing>();
    tracks.set(id, referendum);
    acc.set(trackId, tracks);
    return acc;
  }, new Map<number, Map<number, ReferendumOngoing>>());
}

interface ITrackSelectProps {
  className?: string;
  network: Network;
  referenda: Map<number, ReferendumOngoing>;
  details: Map<number, ReferendumDetails>;
  tracks: Array<TrackCategory>;
  delegateHandler: () => void;
}

export function TrackSelect({
  className,
  network,
  referenda,
  details,
  tracks,
  delegateHandler,
}: ITrackSelectProps) {
  const { state } = useAppLifeCycle();
  const { connectedAccount } = useAccount();
  const isProcessing = extractIsProcessing(state);
  const delegations = extractDelegations(state);
  const { selectedTrackIndexes, setTrackSelection } = useDelegation();
  const allTracks = flattenAllTracks(tracks);
  const undelegatedTracks = filterUndelegatedTracks(state, allTracks);
  const allTrackCheckboxTitle = `All ${
    undelegatedTracks.length !== allTracks.size ? 'undelegated' : ''
  } tracks`;
  const referendaByTrack = partitionReferendaByTrack(referenda);
  const activeReferendaCount = Array.from(referendaByTrack.entries()).reduce(
    (acc, [, track]) => acc + track.size,
    0
  );

  const delegatesWithTracks = extractDelegatedTracks(state);

  return (
    <div className="flex w-full flex-col gap-6 lg:gap-6">
      {delegatesWithTracks.size ? (
        <div className="flex snap-start flex-col items-center">
          <span className="px-3 font-unbounded text-h4">
            Expand your delegation
          </span>
          <p className="text-body">
            You can always delegate undelegated tracks without locking any more
            tokens.
          </p>
          <ChevronDownIcon className="mt-4" />
        </div>
      ) : (
        <div className="flex snap-start flex-col items-center">
          <span className="px-3 font-unbounded text-h4">
            Set up your delegation preferences
          </span>
          <p className="text-body">
            First, select the tracks you would like to delegate, then pick the
            address you&apos;d like to delegate to.
          </p>
        </div>
      )}
      <SectionTitle
        className=""
        title="Select Tracks to Delegate"
        description={
          <span>
            There are currently <b>{activeReferendaCount}</b> active proposals
            on <b>{referendaByTrack.size}</b> tracks.
          </span>
        }
        step={0}
      >
        <ProgressStepper step={0} />
      </SectionTitle>
      <div className="flex flex-col gap-2 lg:gap-4 ">
        <div className="sticky top-44 mb-4 flex flex-row justify-between overflow-visible bg-bg-default/80 px-3 py-3 backdrop-blur-md lg:px-8">
          <CheckBox
            background
            title={allTrackCheckboxTitle}
            checked={
              !!undelegatedTracks.length &&
              selectedTrackIndexes.size === undelegatedTracks.length
            }
            onChange={(e) => {
              const isChecked = e.target.checked;
              undelegatedTracks.map((track) => {
                setTrackSelection(track.id, isChecked);
              });
            }}
            disabled={
              isProcessing || (connectedAccount && !undelegatedTracks.length)
            }
          />
          <div className="flex items-center gap-2">
            <div className="mx-0 hidden text-body-2 text-fg-disabled lg:mx-4 lg:block">
              {selectedTrackIndexes.size > 0
                ? selectedTrackIndexes.size == 1
                  ? `1 track selected`
                  : `${selectedTrackIndexes.size} tracks selected`
                : '0 tracks selected'}
            </div>
            <Button
              disabled={selectedTrackIndexes.size == 0}
              onClick={delegateHandler}
            >
              <div className="flex flex-row items-center justify-center gap-1 whitespace-nowrap">
                <div>Select delegate</div>
                <ChevronDownIcon />
              </div>
            </Button>
          </div>
        </div>
        <div
          className={`mb-12 flex w-full flex-col justify-between px-3 md:flex-row md:gap-4 lg:px-8 ${className}`}
        >
          {tracks.map((category, idx) => (
            <div key={idx} className="flex w-full flex-col gap-2 md:w-1/4">
              <div className="px-4 pb-2">
                <CheckBox
                  title={category.title}
                  checked={category.tracks.every((elem) =>
                    selectedTrackIndexes.has(elem.id)
                  )}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    category.tracks.map((track) => {
                      setTrackSelection(track.id, isChecked);
                    });
                  }}
                  disabled={
                    isProcessing ||
                    category.tracks.every((elem) => delegations.has(elem.id))
                  }
                />
              </div>
              <div className="flex flex-col gap-2 lg:gap-4">
                {category.tracks.map((track, idx) => (
                  <TrackCheckableCard
                    key={idx}
                    track={track}
                    details={details}
                    referenda={referendaByTrack.get(track.id) || new Map()}
                    delegation={delegations.get(track.id)}
                    checked={selectedTrackIndexes.has(track.id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setTrackSelection(track.id, isChecked);
                    }}
                    network={network}
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
