import type { Delegate, State, TrackMetaData } from '../../../lifecycle/types';
import { SyntheticEvent, useState } from 'react';
import { ChevronRightIcon, DelegateIcon, CloseIcon } from '../../icons';
import { Button, Card } from '../../lib';
import { Accounticon } from '../accounts/Accounticon.js';
import { DelegateInfoModal } from './delegateModal/DelegateInfo';
import {
  flattenAllTracks,
  filterUndelegatedTracks,
  extractIsProcessing,
} from '../../../lifecycle';
import { InnerCard } from '../common/InnerCard';
import { useAccount, useDelegation } from '../../../contexts';
import EllipsisTextbox from '../EllipsisTextbox';
import { UndelegateModal } from './delegateModal/Undelegate';
import { LabeledBox, TracksLabel } from '../common/LabeledBox';
import { TxnModal } from './delegateModal/TxnModal';
import { SimpleAnalytics } from '../../../analytics';
import { useNavigate, Link } from 'react-router-dom';
import { ConnectButton } from '../accounts/ConnectButton';

function retainByIndex(map: Map<number, TrackMetaData>, indexes: number[]) {
  const newMap = new Map();
  indexes.forEach((index) => newMap.set(index, map.get(index)));
  return newMap;
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
        {tracks.length > 0 && (
          <LabeledBox title="Tracks delegated">
            <TracksLabel
              allTracksCount={allTracksCount}
              tracks={tracks}
              visibleCount={2}
            />
          </LabeledBox>
        )}
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={(e) => {
            openModal();
            e.stopPropagation();
          }}
        >
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
  delegatedTracks = [],
  variant,
  className,
}: {
  delegate: Delegate;
  state: State;
  delegatedTracks?: TrackMetaData[];
  variant: 'all' | 'some' | 'none';
  className?: string;
}) {
  const { name, address, manifesto } = delegate;
  const isProcessing = extractIsProcessing(state);

  const { connectedAccount } = useAccount();
  const [txVisible, setTxVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const navigate = useNavigate();

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
    e.preventDefault();
    openTxModal();
    setInfoVisible(false); //have to close info modal to make tx modal visible - not ideal, should be replacing content within 1 modal

    SimpleAnalytics.track('Click', { target: 'Delegate', variant });
  };

  // more info Modal handlers
  const closeInfoModal = () => {
    setInfoVisible(false);
  };

  // extract tracks yet to be delegated
  const { selectedTrackIndexes } = useDelegation();
  const allTracks = flattenAllTracks(state.tracks);
  const allSelectedTracks = retainByIndex(
    allTracks,
    Array.from(selectedTrackIndexes.keys())
  );
  // If variant is 'all', select all not yet delegated tracks. If not, rely on current selection
  const selectedTracks = filterUndelegatedTracks(
    state,
    variant === 'all' ? allTracks : allSelectedTracks
  );

  const navigationTarget = `/${address}`;

  return (
    <div
      className={`flex min-h-full shrink-0  ${className} ${
        variant === 'all' ? 'w-[320px] md:w-[420px]' : 'w-full'
      }`}
    >
      <Card className={` shadow-sd flex w-full flex-col gap-2 p-6 md:gap-4`}>
        <Link to={navigationTarget}>
          <div className="flex cursor-pointer items-start justify-between">
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
        </Link>

        {manifesto && (
          <div onClick={() => navigate(navigationTarget)}>
            <EllipsisTextbox
              className="max-h-[6rem] lg:h-[6rem]"
              text={manifesto}
              expandLinkTitle="Read more ->"
            />
          </div>
        )}
        <div className="grow" />

        {delegatedTracks.length > 0 && (
          <DelegatedTracks
            disabled={isProcessing}
            allTracksCount={flattenAllTracks(state.tracks).size}
            delegate={delegate}
            tracks={delegatedTracks}
          />
        )}
        {variant === 'all' &&
          (connectedAddress ? (
            <Button
              variant="primary"
              onClick={delegateHandler}
              disabled={isProcessing}
            >
              <div>Delegate all tracks</div>
              <DelegateIcon />
            </Button>
          ) : (
            <ConnectButton />
          ))}
      </Card>
      {txVisible && (
        <TxnModal
          open={txVisible}
          onClose={closeTxModal}
          delegate={delegate}
          selectedTracks={selectedTracks}
        />
      )}
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
