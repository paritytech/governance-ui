import React, { useMemo, useRef, useState } from 'react';
import {
  Button,
  ButtonOutline,
  ButtonSecondary,
  Dropdown,
  Modal,
} from '../lib';
import { DelegateCard } from '../components/delegation/DelegateCard';
import { TrackSelect } from '../components/delegation/TrackSelect.js';
import { AddIcon, ChevronRightIcon, CloseIcon } from '../icons';
import { DelegationProvider, useDelegation } from '../../contexts/Delegation';
import SectionTitle from '../components/SectionTitle';
import ProgressStepper from '../components/ProgressStepper.js';
import { ConnectedState, Delegate, State } from '../../lifecycle/types.js';
import {
  useAppLifeCycle,
  filterOngoingReferenda,
  extractRoles,
} from '../../lifecycle';
import { ReferendumOngoing } from '../../types';
import Headline from '../components/Headline';
import { Option } from '../lib/Dropdown';
import { DelegateModal } from '../components/delegation/delegateModal/Delegate';
import { trackCategories } from '../../chain';
import { isValidAddress } from '../../utils/polkadot-api';

export function AddAddressModal({
  open,
  onAddressValidated,
  onClose,
}: {
  open: boolean;
  onAddressValidated: (address: string) => void;
  onClose: () => void;
}) {
  const [address, setAddress] = useState<string>();

  const cancelHandler = () => onClose();

  return (
    <Modal size="md" open={open} onClose={() => onClose()}>
      <div className="flex w-full flex-col gap-12 p-4 md:p-12">
        <div className="flex flex-col items-start justify-start gap-6">
          <div className="text-left">
            <h2 className="mb-2 text-3xl font-medium">Add Address</h2>
            <p className="text-base">
              Don&apos;t see your delegate in the list? No problem, add them
              bellow.
            </p>
          </div>
          <div className="flex w-full flex-col">
            <label htmlFor="address" className="flex items-center py-2 text-sm">
              Delegate Address
            </label>
            <input
              id="address"
              placeholder="Polkadot Address"
              className="w-full self-stretch rounded-lg bg-[#ebeaea] px-4 py-2 text-left text-sm text-black opacity-70"
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full flex-row justify-end gap-4">
          <ButtonSecondary onClick={cancelHandler}>
            <CloseIcon />
            <div>Cancel</div>
          </ButtonSecondary>
          <Button
            onClick={() => address && onAddressValidated(address)}
            disabled={!(address && isValidAddress(address))}
          >
            <div>Add Delegate</div>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function filterVisibleDelegates(delegates: Delegate[]): Delegate[] {
  const shuffledDelegates = new Array(...delegates).sort(
    () => 0.5 - Math.random()
  );
  return shuffledDelegates.slice(0, 5);
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
    <section className="flex w-full flex-col items-center justify-center gap-12 bg-gray-200 py-12">
      <span className="font-unbounded text-h3 font-semibold">
        Choose a worthy delegate
      </span>
      <div className="flex max-w-full gap-7 overflow-x-scroll px-3 pb-1 lg:px-6	">
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

function DescriptionLabel({ delegates }: { delegates: number }): JSX.Element {
  return (
    <div className="text-body-2">
      There are currently <span className="font-bold">{delegates}</span>{' '}
      delegates.
    </div>
  );
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

export const DelegateSection = () => {
  const { state } = useAppLifeCycle();
  const { delegates } = state;
  const [search, setSearch] = useState<string>();
  const [addAddressVisible, setAddAddressVisible] = useState(false);
  const [delegateVisible, setDelegateVisible] = useState(false);
  const [delegate, setDelegate] = useState('');
  const { selectedTracks } = useDelegation();
  const tracks = trackCategories
    .map((track) => track.tracks)
    .flat()
    .filter((track) => selectedTracks.has(track.id));

  const aggregateOptions: Option[] = [
    { value: 0, label: 'All User Types', active: true },
    { value: 1, label: 'Fellows' },
  ];

  const [selectedOption, setSelectedOption] = useState<Option>(
    aggregateOptions[0]
  );

  return (
    <>
      <div className="mb-48 mt-6 flex w-full flex-col gap-16 px-3 md:px-8">
        <SectionTitle
          title="Browse Delegates"
          description={<DescriptionLabel delegates={delegates.length} />}
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
              <ButtonOutline
                className="w-fit"
                onClick={() => setAddAddressVisible(true)}
              >
                <AddIcon />
                <div className="whitespace-nowrap">Add address</div>
              </ButtonOutline>
              <input
                placeholder="Search"
                className="w-full self-stretch rounded-lg bg-[#ebeaea] px-4 py-2 text-left text-sm text-black opacity-70 lg:w-fit"
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 place-items-center  gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {filterDelegatesByOption(state, delegates, selectedOption)
              .filter((delegate) =>
                search ? delegate.name.includes(search) : true
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
      <AddAddressModal
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
        tracks={tracks}
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

function DelegationPanelContent({ state }: { state: State }): JSX.Element {
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
          delegateHandler={() => gotoSection(delegateSectionRef)}
        />
      </div>
      {selectedTracks.size > 0 && (
        <div className="w-full" ref={delegateSectionRef}>
          <DelegateSection />
        </div>
      )}
    </>
  );
}

export function DelegationPanel() {
  const { state } = useAppLifeCycle();
  return (
    <DelegationProvider>
      <main className="flex max-w-full flex-auto flex-col items-center justify-start gap-16 pt-14 md:pt-20">
        <Headline />
        <DelegatesBar delegates={state.delegates} state={state} />
        <DelegationPanelContent state={state} />
      </main>
    </DelegationProvider>
  );
}
