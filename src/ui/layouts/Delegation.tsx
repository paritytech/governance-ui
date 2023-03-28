import React, { useRef, useState } from 'react';
import { ButtonOutline } from '../lib';
import { DelegateCard } from '../components/delegation/DelegateCard';
import { TrackSelect } from '../components/delegation/TrackSelect.js';
import { AddIcon, ChevronDownIcon } from '../icons';
import { DelegationProvider } from '../../contexts/Delegation';
import SectionTitle from '../components/SectionTitle';
import ProgressStepper from '../components/ProgressStepper.js';
import { ConnectedState, State } from '../../lifecycle/types.js';
import { useAppLifeCycle, filterOngoingReferenda } from '../../lifecycle';
import { ReferendumOngoing } from '../../types';
import Headline from '../components/Headline';

export function DelegatesBar() {
  const { state } = useAppLifeCycle();
  const { delegates } = state;
  return (
    <section className="flex w-full flex-col items-center justify-center gap-12 bg-gray-200 py-12">
      <span className="font-unbounded text-h3 font-semibold">
        Choose a worthy delegate
      </span>
      <div className="flex max-w-full gap-7 overflow-x-scroll px-3 pb-1 lg:px-6	">
        {delegates.map((delegate, idx) => (
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
      There are currently{' '}
      <span className="font-bold">{delegates} delegates.</span>
    </div>
  );
}

export const DelegateSection = () => {
  const { state } = useAppLifeCycle();
  const { delegates } = state;
  const [search, setSearch] = useState<string>();
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
            <div className="flex w-full flex-row items-center justify-between gap-4 lg:justify-start">
              <input
                placeholder="Search"
                className="w-full self-stretch rounded-lg bg-[#ebeaea] px-4 py-2 text-left text-sm text-black opacity-70 lg:w-fit"
                onChange={(event) => setSearch(event.target.value)}
              />
              <ButtonOutline className="w-fit">
                <AddIcon />
                <div className="whitespace-nowrap">Add address</div>
              </ButtonOutline>
            </div>
            <div className="flex w-full flex-row items-center justify-start gap-4 lg:justify-end">
              <ButtonOutline>
                <div>Aggregate Best</div>
                <ChevronDownIcon />
              </ButtonOutline>
              <ButtonOutline>
                <div>Status</div>
                <ChevronDownIcon />
              </ButtonOutline>
            </div>
          </div>
          <div className="grid grid-cols-1 place-items-center  gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {delegates
              ?.filter((delegate) =>
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
    </>
  );
};

function exportReferenda(state: State): Map<number, ReferendumOngoing> {
  if (state.type === 'ConnectedState') {
    return filterOngoingReferenda(state.chain.referenda);
  }
  return new Map();
}

export function DelegationPanel() {
  const { state } = useAppLifeCycle();
  const delegateSectionRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);
  const trackSectionRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);
  const gotoSection = (section: any) => {
    section?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const network = (state as ConnectedState).network;
  return (
    <DelegationProvider>
      <main className="flex max-w-full flex-auto flex-col items-center justify-start gap-16 pt-14 md:pt-20">
        <Headline />
        <DelegatesBar />
        <div className="w-full" ref={trackSectionRef}>
          <TrackSelect
            network={network}
            details={state.details}
            referenda={exportReferenda(state)}
            delegateHandler={() => gotoSection(delegateSectionRef)}
          />
        </div>
        <div className="w-full" ref={delegateSectionRef}>
          <DelegateSection />
        </div>
      </main>
    </DelegationProvider>
  );
}
