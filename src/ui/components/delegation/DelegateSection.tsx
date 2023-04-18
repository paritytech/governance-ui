import { useState } from 'react';
import { Delegate, State } from '../../../lifecycle/types.js';
import { useDelegation } from '../../../contexts/Delegation';

import { flattenAllTracks } from '../../../lifecycle';

import SectionTitle from '../SectionTitle.js';
import ProgressStepper from '../ProgressStepper.js';
import { Button } from '../../lib';
import { AddIcon } from '../../icons/index.js';
import { DelegateCard } from './DelegateCard.js';
import { AddDelegateModal } from './delegateModal/AddDelegateModal.js';
import { TxnModal } from './delegateModal/TxnModal.js';

export const DelegateSection = ({
  state,
  delegates,
}: {
  state: State;
  delegates: Delegate[];
}) => {
  const [search, setSearch] = useState<string>();
  const [addAddressVisible, setAddAddressVisible] = useState(false);
  const [delegateVisible, setDelegateVisible] = useState(false);
  const [delegate, setDelegate] = useState('');
  const { selectedTrackIndexes } = useDelegation();
  const allTracks = flattenAllTracks(state.tracks);
  const selectedTracks = Array.from(selectedTrackIndexes.entries()).map(
    ([id]) => allTracks.get(id)!
  );

  return (
    <>
      <div className="mb-48 flex w-full flex-col gap-16">
        <SectionTitle
          title="Browse Delegates"
          description={
            <span>
              There are currently <b>{delegates.length}</b> delegates.
            </span>
          }
        >
          <ProgressStepper step={1} />
        </SectionTitle>
        <div className=" flex flex-col gap-4 ">
          <div className="sticky top-44 flex w-full flex-col items-center justify-between gap-4 bg-bg-default/80 px-3 py-3 backdrop-blur-md md:flex-row lg:px-8">
            <div className="flex w-full flex-row items-center justify-between gap-4">
              <Button
                variant="ghost"
                className="w-fit"
                onClick={() => setAddAddressVisible(true)}
              >
                <AddIcon />
                <div className="whitespace-nowrap">Add address</div>
              </Button>
              <input
                placeholder="Search"
                className="w-full self-stretch rounded-lg bg-[#ebeaea] px-4 py-2 text-left text-sm text-black opacity-70 lg:w-fit"
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          {state.customDelegates?.length > 0 && (
            <div className="flex flex-col gap-4 px-3 lg:px-8">
              <div className="text-sm">Added manually</div>
              <div className="grid grid-cols-1 place-items-center  gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                {state.customDelegates.map((delegate, idx) => (
                  <DelegateCard
                    key={idx}
                    delegate={delegate}
                    state={state}
                    variant="some"
                  />
                ))}
              </div>
              <div className="text-sm">Public Delegates</div>
            </div>
          )}
          <div className="grid grid-cols-1 place-items-center gap-2 px-3  md:grid-cols-2 lg:grid-cols-3 lg:gap-4 lg:px-8">
            {delegates
              .filter((delegate) =>
                search
                  ? delegate.name?.toLowerCase().includes(search.toLowerCase())
                  : true
              )
              .map((delegate, idx) => (
                <DelegateCard
                  key={idx}
                  delegate={delegate}
                  state={state}
                  variant="some"
                />
              ))}
          </div>
        </div>
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
    </>
  );
};
