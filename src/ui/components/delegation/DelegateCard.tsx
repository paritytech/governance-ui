import type { Delegate, State, TrackMetaData } from '../../../lifecycle/types';
import { SyntheticEvent, useState } from 'react';
import { ChevronRightIcon, DelegateIcon, CloseIcon } from '../../icons';
import { Button, Card } from '../../lib';
import { Accounticon } from '../accounts/Accounticon.js';
import { DelegateInfoModal } from './delegateModal/DelegateInfo';
// import { StatBar } from '../common/Stats';
import { RoleTag } from '../common/RoleTag';
import {
  allTracksCount,
  extractDelegations,
  extractIsProcessing,
  extractRoles,
} from '../../../lifecycle';
import { filterTracks } from '../../../lifecycle';
import { DelegateModal } from './delegateModal/Delegate';
import { InnerCard } from '../common/InnerCard';
import { useAccount, useDelegation } from '../../../contexts';
import EllipsisTextbox from '../EllipsisTextbox';
import { UndelegateModal } from './delegateModal/Undelegate';
import { LabeledBox, TracksLabel } from '../common/LabeledBox';

function filterUndelegatedTracks(state: State): TrackMetaData[] {
  const delegatedTrackIds = new Set(extractDelegations(state).keys());
  return filterTracks(state.tracks, (t) => !delegatedTrackIds.has(t.id));
}

function DelegatedTracks({
  disabled,
  allTracksCount,
  tracks,
  delegate,
}: {
  disabled: boolean;
  allTracksCount: number;
  tracks: TrackMetaData[];
  delegate: Delegate;
}) {
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
        <LabeledBox title="Tracks delegated">
          <TracksLabel
            allTracksCount={allTracksCount}
            tracks={tracks}
            visibleCount={2}
          />
        </LabeledBox>
        <Button variant="ghost" disabled={disabled} onClick={() => openModal()}>
          <CloseIcon />
          <div>Undelegate All</div>
        </Button>
      </InnerCard>
      <UndelegateModal
        onClose={closeModal}
        open={showModal}
        tracks={tracks}
        address={delegate.address}
      />
    </>
  );
}

export function DelegateCard({
  delegate,
  state,
  variant,
  withTracks = false,
  className,
}: {
  delegate: Delegate;
  state: State;
  variant: 'all' | 'some' | 'none';
  withTracks?: boolean;
  className?: string;
}) {
  const { name, address, manifesto } = delegate;
  const roles = extractRoles(address, state);
  const isProcessing = extractIsProcessing(state);

  const { connectedAccount } = useAccount();
  const [txVisible, setTxVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  const connectedAddress = connectedAccount?.account?.address;

  // transaction Modal handlers
  const closeTxModal = () => {
    setTxVisible(false);
  };
  const openTxModal = () => {
    setTxVisible(true);
  };
  const delegateHandler = (e: SyntheticEvent) => {
    e.stopPropagation();
    openTxModal();
    setInfoVisible(false); //have to close info modal to make tx modal visible - not ideal, should be replacing content within 1 modal
  };

  // more info Modal handlers
  const closeInfoModal = () => {
    setInfoVisible(false);
  };
  const openInfoModal = () => {
    setInfoVisible(true);
  };
  const expandHandler = () => {
    openInfoModal();
  };

  // extract tracks are yet to be delegated
  const undelegatedTracks = filterUndelegatedTracks(state);
  const { selectedTracks } = useDelegation();
  const someTracks = filterTracks(state.tracks, (t) =>
    selectedTracks.has(t.id)
  );
  const tracks = variant === 'all' ? undelegatedTracks : someTracks;

  // extract tracks that are already delegated
  const delegatedTrackSet = new Set(delegate.delegatedTracks);
  const delegatedTracks = filterTracks(state.tracks, (t) =>
    delegatedTrackSet.has(t.id)
  );

  return (
    <div
      className={`flex h-full shrink-0  ${className} ${
        variant === 'all' ? 'w-[320px] md:w-[420px]' : 'w-full'
      }`}
    >
      <Card
        className={`flex h-full w-full flex-col gap-2 p-6 shadow-md md:gap-4`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start">
            <h2 className="text-xl capitalize">{name || 'Anonymous'}</h2>
            <Accounticon
              address={address}
              size={24}
              textClassName="text-body font-semibold my-2"
            />
          </div>
          {variant === 'some' && (
            <Button onClick={delegateHandler} disabled={isProcessing}>
              <div className="flex w-full flex-nowrap items-center justify-center gap-1">
                <div>Select</div>
                <ChevronRightIcon />
              </div>
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {roles.map((role) => (
            <RoleTag key={role} role={role} />
          ))}
        </div>
        {manifesto && (
          <EllipsisTextbox
            className="max-h-[6rem] lg:h-[6rem]"
            text={manifesto}
            expandLinkTitle="Read more ->"
            onExpand={expandHandler}
          />
        )}
        <div className="grow" />

        {
          // ToDo: Add stats
          /*<StatBar stats={[]} />*/
        }

        {withTracks && delegatedTracks?.length && (
          <DelegatedTracks
            disabled={isProcessing}
            allTracksCount={allTracksCount(state.tracks)}
            delegate={delegate}
            tracks={delegatedTracks}
          />
        )}
        {variant === 'all' && (
          <Button
            variant="primary"
            onClick={delegateHandler}
            disabled={isProcessing || !connectedAddress}
          >
            <div>Delegate All Votes</div>
            <DelegateIcon />
          </Button>
        )}
      </Card>
      <DelegateModal
        open={txVisible}
        onClose={closeTxModal}
        delegate={delegate}
        selectedTracks={tracks}
      />
      <DelegateInfoModal
        open={infoVisible}
        onClose={closeInfoModal}
        delegate={delegate}
      >
        <Button
          className="w-fit"
          onClick={delegateHandler}
          disabled={isProcessing}
        >
          <div className="flex w-full flex-nowrap items-center justify-center gap-1">
            <div>Select</div>
            <ChevronRightIcon />
          </div>
        </Button>
      </DelegateInfoModal>
    </div>
  );
}
