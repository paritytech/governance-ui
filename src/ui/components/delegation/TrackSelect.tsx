import type { Tally, VotingDelegating } from '../../../types';

import { memo, useState } from 'react';
import { useDelegation } from '../../../contexts/Delegation.js';
import { Button } from '../../lib';
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
import { SimpleAnalytics } from '../../../analytics';
import Tooltip from '../Tooltip';

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
    return `${base} - ${detail.title || 'Untitled'}`;
  } else {
    return base;
  }
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
    <InnerCard className="gap-2 border-[1px] border-solid border-gray-200 bg-white text-body-2 font-medium">
      <div className="flex flex-row gap-2">
        <a
          className="grow overflow-hidden text-ellipsis leading-tight"
          href={`https://${network.toLowerCase()}.polkassembly.io/referenda/${index}`}
          target="_blank"
          rel="noreferrer"
        >
          {referendaTitle(index, details)}
        </a>
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
            copy={true}
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
    <div className="flex w-full flex-col gap-3">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex w-full items-center gap-1">
            <CheckBox
              title={track?.title}
              checked={checked}
              onChange={onChange}
              disabled={disabled}
            />
            <span className="select-none overflow-hidden text-ellipsis whitespace-nowrap text-body-2 text-fg-dim">
              {referenda.size}
            </span>
          </div>
          <Tooltip
            content={<span>{track?.description}</span>}
            title={track?.title}
          />
        </div>

        {delegation && (
          <TrackDelegation track={track} delegation={delegation} />
        )}
      </div>
      {referenda.size > 0 &&
        Array.from(referenda.entries()).map(([index, referendum]) => (
          <ReferendaDetails
            key={index}
            index={index}
            details={details}
            referendum={referendum}
            network={network}
          />
        ))}
    </div>
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
    <div className="flex w-full flex-col gap-6 lg:gap-12">
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
            - Or - Select tracks to delegate
          </span>
          <p className="px-4 text-body">
            First, select the tracks you would like to delegate, then pick the
            address you&apos;d like to delegate to.
          </p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <SectionTitle
          className=""
          title="Current activity"
          description={
            referendaByTrack.size > 0 ? (
              <span>
                There are currently <b>{activeReferendaCount}</b> active
                proposals on <b>{referendaByTrack.size}</b> tracks.
              </span>
            ) : (
              <span className="text-fg-disabled">
                Failed to fetch proposals.
              </span>
            )
          }
          step={0}
        >
          <ProgressStepper step={0} />
        </SectionTitle>
        <div className="flex flex-col gap-2 lg:gap-4 ">
          <div className="sticky top-52 mb-4 flex flex-row justify-between overflow-visible bg-bg-default/80 px-3 py-3 backdrop-blur-sm lg:top-44 lg:px-8">
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
                SimpleAnalytics.track('Select', { target: 'AllTracks' });
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
            className={`mb-12 flex w-full flex-col justify-between px-3 md:flex-row md:gap-12 lg:px-8 ${className}`}
          >
            {tracks.map((category, idx) => (
              <div key={idx} className="flex w-full flex-col gap-6 md:w-1/4">
                <div className="border-b-[1px] pb-3">
                  <CheckBox
                    title={category.title}
                    checked={category.tracks.every(
                      ({ id }) =>
                        selectedTrackIndexes.has(id) || delegations.has(id)
                    )}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      category.tracks.map(({ id }) => {
                        if (!delegations.has(id)) {
                          setTrackSelection(id, isChecked);
                        }
                      });
                      SimpleAnalytics.track('Select', {
                        target: 'Category',
                        id: category.title,
                      });
                    }}
                    disabled={
                      isProcessing ||
                      category.tracks.every((elem) => delegations.has(elem.id))
                    }
                  />
                </div>
                <div className="flex w-full flex-col gap-6 lg:gap-4">
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
                        SimpleAnalytics.track('Select', {
                          target: 'Track',
                          id: track.id.toString(),
                        });
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
    </div>
  );
}
