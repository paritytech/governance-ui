import React, { useMemo, useRef, useState } from 'react';
import { Button, Dropdown } from '../lib';
import { DelegateCard } from '../components/delegation/DelegateCard';
import { TrackSelect } from '../components/delegation/TrackSelect.js';
import { AddIcon } from '../icons';
import { DelegationProvider, useDelegation } from '../../contexts/Delegation';
import SectionTitle from '../components/SectionTitle';
import ProgressStepper from '../components/ProgressStepper.js';
import { ConnectedState, Delegate, State } from '../../lifecycle/types.js';
import {
  useAppLifeCycle,
  filterOngoingReferenda,
  extractRoles,
  extractDelegatedTracks,
  filterTracks,
} from '../../lifecycle';
import { ReferendumOngoing } from '../../types';
import Headline from '../components/Headline';
import { Option } from '../lib/Dropdown';
import { DelegateModal } from '../components/delegation/delegateModal/Delegate';
import { AddDelegateModal } from '../components/delegation/delegateModal/AddDelegateModal';

function filterVisibleDelegates(delegates: Delegate[]): Delegate[] {
  const shuffledDelegates = new Array(...delegates).sort(
    () => 0.5 - Math.random()
  );
  return shuffledDelegates.slice(0, 5);
}

function filterDelegatesByOption(
  state: State,
  delegates: Delegate[],
  option: Option
): Delegate[] {
  switch (option.value) {
    case 1:
      return delegates.filter((delegate) =>
        extractRoles(delegate.address, state).includes('fellow')
      );
  }
  return delegates;
}

function filterActiveDelegates(delegates: Delegate[]) {
  return delegates.filter((del) => !!del.delegatedTracks?.length);
}

function filterInactiveDelegates(delegates: Delegate[]) {
  return delegates.filter((del) => !del.delegatedTracks?.length);
}

function decorateDelegatesWithDelegations(
  state: State,
  delegates: Delegate[]
): Delegate[] {
  const delegatedTracks = extractDelegatedTracks(state);
  const decorated = delegates.map((delegate) => ({
    ...delegate,
    delegatedTracks: delegatedTracks.get(delegate.address),
  }));
  return decorated;
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
  return (
    <section className="flex w-full flex-col items-center justify-center gap-6 bg-gray-200 py-8 md:gap-12">
      <SectionTitle title="Choose a worthy delegate" />
      <div className="flex max-w-full gap-7 overflow-x-auto px-3 pb-1 lg:px-6	">
        {visibleDelegates.map((delegate, idx) => (
          <DelegateCard
            key={idx}
            delegate={delegate}
            state={state}
            variant="all"
          />
        ))}
      </div>
    </section>
  );
}

export const ActiveDelegates = ({
  state,
  delegates,
}: {
  state: State;
  delegates: Delegate[];
}) => {
  return (
    <>
      <div className="mt-8 flex w-full flex-col gap-16 px-3 md:px-8">
        <SectionTitle title="Active Delegates" />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 place-items-center  gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {delegates.map((delegate, idx) => (
              <DelegateCard
                key={idx}
                delegate={delegate}
                state={state}
                variant="none"
                withTracks
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

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
  const { selectedTracks } = useDelegation();
  const tracks = filterTracks(state.tracks, (t) => selectedTracks.has(t.id));

  const aggregateOptions: Option[] = [
    { value: 0, label: 'All User Types', active: true },
    { value: 1, label: 'Fellows' },
  ];

  const [selectedOption, setSelectedOption] = useState<Option>(
    aggregateOptions[0]
  );

  return (
    <>
      <div className="mb-48 mt-20 flex w-full flex-col gap-16 px-3 md:px-8 lg:mt-28">
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
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex w-full flex-row items-center justify-start gap-4 lg:justify-start">
              <Dropdown
                options={aggregateOptions}
                onSelect={setSelectedOption}
                menuAlign={'right'}
              />
            </div>
            <div className="flex w-full flex-row items-center justify-between gap-4 lg:justify-end">
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
            <>
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
            </>
          )}
          <div className="grid grid-cols-1 place-items-center  gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {filterDelegatesByOption(state, delegates, selectedOption)
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
      <DelegateModal
        open={delegateVisible}
        onClose={() => setDelegateVisible(false)}
        delegate={delegate}
        selectedTracks={tracks}
      />
    </>
  );
};

function exportReferenda(state: State): Map<number, ReferendumOngoing> {
  if (state.type === 'ConnectedState') {
    return filterOngoingReferenda(state.chain.referenda);
  }
  return new Map();
}

function DelegationPanelContent({
  state,
  delegates,
}: {
  state: State;
  delegates: Delegate[];
}): JSX.Element {
  const network = (state as ConnectedState).network;
  const delegateSectionRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);
  const gotoSection = (section: any) => {
    section?.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const { selectedTracks } = useDelegation();
  return (
    <>
      <div className="w-full">
        <TrackSelect
          network={network}
          details={state.details}
          referenda={exportReferenda(state)}
          tracks={state.tracks}
          delegateHandler={() => gotoSection(delegateSectionRef)}
        />
      </div>
      {selectedTracks.size > 0 && (
        <div className="w-full" ref={delegateSectionRef}>
          <DelegateSection state={state} delegates={delegates} />
        </div>
      )}
    </>
  );
}

export function DelegationPanel() {
  const { state } = useAppLifeCycle();

  // decorate delegates with delegated tracks
  let { delegates } = state;
  delegates = decorateDelegatesWithDelegations(state, delegates);

  const activeDelegates = filterActiveDelegates(delegates);

  return (
    <DelegationProvider>
      <main className="flex w-full flex-auto flex-col items-center justify-start gap-8 pt-14 md:pt-20 lg:gap-16">
        {activeDelegates.length ? (
          <ActiveDelegates delegates={activeDelegates} state={state} />
        ) : (
          <>
            <Headline />
            <DelegatesBar delegates={state.delegates} state={state} />
          </>
        )}
        <DelegationPanelContent delegates={delegates} state={state} />
      </main>
    </DelegationProvider>
  );
}
