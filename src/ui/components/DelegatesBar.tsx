import { useMemo, useState } from 'react';
import { Delegate, State } from '../../lifecycle/types.js';
import { DelegateCard } from './delegation/DelegateCard.js';
import { Button } from '../lib/Button.js';
import { AddIcon } from '../icons/index.js';
import { AddDelegateModal } from './delegation/delegateModal/AddDelegateModal.js';
import { TxnModal } from './delegation/delegateModal/TxnModal.js';
import { useDelegation } from '../../contexts/Delegation';
import { flattenAllTracks } from '../../lifecycle';

function filterVisibleDelegates(delegates: Delegate[]): Delegate[] {
  return new Array(...delegates).sort(() => 0.5 - Math.random());
}

export function DelegatesBar({
  state,
  delegates,
}: {
  state: State;
  delegates: Delegate[];
}) {
  const visibleDelegates = useMemo(
    () => filterVisibleDelegates(delegates),
    [delegates]
  );

  const [addAddressVisible, setAddAddressVisible] = useState(false);
  const [delegateVisible, setDelegateVisible] = useState(false);
  const [delegate, setDelegate] = useState('');

  const { selectedTrackIndexes } = useDelegation();

  const allTracks = flattenAllTracks(state.tracks);

  const selectedTracks = Array.from(selectedTrackIndexes.entries()).map(
    ([id]) => allTracks.get(id)!
  );

  return (
    <section
      className={`flex w-full flex-col items-center justify-center gap-6 bg-gray-200 py-8 ${
        visibleDelegates.length > 0 ? 'md:gap-12' : 'md:gap-6'
      }`}
    >
      <div className="flex w-full justify-between gap-0 px-6">
        <div className="w-24" />
        <span className="px-3 font-unbounded text-h4">
          Delegate all votes to a Top Voter
        </span>
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => setAddAddressVisible(true)}
        >
          <AddIcon />
          <div className="whitespace-nowrap">Add a delegate</div>
        </Button>
      </div>
      <div className="flex max-w-full snap-x scroll-pl-6 gap-7 overflow-x-auto px-3 pb-1 lg:px-6	">
        {visibleDelegates.length > 0 ? (
          visibleDelegates.map((delegate, idx) => (
            <DelegateCard
              className="snap-start"
              key={idx}
              delegate={delegate}
              state={state}
              variant="all"
            />
          ))
        ) : (
          <span className="text-body-2 text-fg-disabled">
            Failed to fetch delegates.
          </span>
        )}
      </div>
      <AddDelegateModal
        open={addAddressVisible}
        onClose={() => setAddAddressVisible(false)}
        onAddressValidated={(address) => {
          setDelegate(address);
          setAddAddressVisible(false);
          setDelegateVisible(true);
        }}
      />
      {delegateVisible && (
        <TxnModal
          open={delegateVisible}
          onClose={() => setDelegateVisible(false)}
          delegate={delegate}
          selectedTracks={selectedTracks}
        />
      )}
    </section>
  );
}
