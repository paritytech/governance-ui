import type { TrackType } from './types';
import type { Delegate, State } from '../../../lifecycle/types';
import { useState } from 'react';
import { ChevronRightIcon, DelegateIcon } from '../../icons';
import { Button, ButtonSecondary, Card } from '../../lib';
import { Accounticon } from '../accounts/Accounticon.js';
import { DelegateInfoModal } from './delegateModal/DelegateInfo';
import { StatBar } from './common/Stats';
import { RoleTag } from './common/RoleTag';
import {
  extractDelegations,
  extractIsProcessing,
  extractRoles,
} from '../../../lifecycle';
import { trackCategories } from '../../../chain/index';
import { DelegateModal } from './delegateModal/Delegate';
import { useDelegation } from '../../../contexts';
import EllipsisTextbox from '../EllipsisTextbox';

function filterUndelegatedTracks(state: State): TrackType[] {
  const delegatedTrackIds = new Set(extractDelegations(state).keys());
  return trackCategories
    .map((track) => track.tracks)
    .flat()
    .filter((t) => !delegatedTrackIds.has(t.id));
}

export function DelegateCard({
  delegate,
  state,
  variant,
}: {
  delegate: Delegate;
  state: State;
  variant: 'all' | 'some';
}) {
  const { name, address, manifesto } = delegate;
  const roles = extractRoles(address, state);
  const isProcessing = extractIsProcessing(state);

  const [txVisible, setTxVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  // transaction Modal handlers
  const closeTxModal = () => {
    setTxVisible(false);
  };
  const openTxModal = () => {
    setTxVisible(true);
  };
  const delegateHandler = () => openTxModal();

  // more info Modal handlers
  const closeInfoModal = () => {
    setInfoVisible(false);
  };
  const openInfoModal = () => {
    setInfoVisible(true);
  };
  const expandHandler = () => openInfoModal();

  // extract tracks
  const undelegatedTracks = filterUndelegatedTracks(state);
  const { selectedTracks } = useDelegation();
  const someTracks = trackCategories
    .map((track) => track.tracks)
    .flat()
    .filter((track) => selectedTracks.has(track.id));
  const tracks = variant === 'all' ? undelegatedTracks : someTracks;

  return (
    <>
      <Card
        className={`flex h-full shrink-0 grow-0 flex-col gap-4 p-6 shadow-md ${
          variant === 'all' ? 'w-[420px]' : 'w-full'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start">
            <h2 className="text-xl capitalize">{name}</h2>
            <Accounticon
              address={address}
              size={24}
              textClassName="font-semibold my-2"
            />
          </div>
          {variant === 'some' && (
            <ButtonSecondary onClick={delegateHandler} disabled={isProcessing}>
              <div className="flex w-full flex-nowrap items-center justify-center gap-1">
                <div>Select</div>
                <ChevronRightIcon />
              </div>
            </ButtonSecondary>
          )}
        </div>
        <div className="flex gap-2">
          {roles.map((role) => (
            <RoleTag key={role} role={role} />
          ))}
        </div>
        <EllipsisTextbox
          className="h-[6rem]"
          text={manifesto}
          expandLinkTitle="Read more->"
          onExpand={() => expandHandler()}
        />
        <StatBar stats={[]} />
        <div className="grow" />
        {variant === 'all' && (
          <Button onClick={() => openTxModal()} disabled={isProcessing}>
            <div>Delegate All Votes</div>
            <DelegateIcon />
          </Button>
        )}
      </Card>
      <DelegateModal
        open={txVisible}
        onClose={closeTxModal}
        delegate={delegate}
        tracks={tracks}
      />
      <DelegateInfoModal
        open={infoVisible}
        onClose={closeInfoModal}
        delegate={delegate}
      />
    </>
  );
}
