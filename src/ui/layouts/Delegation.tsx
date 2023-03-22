import React, { useRef, useState } from 'react';
import { ButtonOutline } from '../lib';
import { DelegateCard } from '../components/delegation/DelegateCard';
import { DelegateModal } from '../components/delegation/delegateModal/Summary.js';
import { TrackSelect } from '../components/delegation/TrackSelect.js';
import { tracksMetadata } from '../../chain/mocks';
import { AddIcon, ChevronDownIcon } from '../icons';
import { DelegationProvider, useDelegation } from '../../contexts/Delegation';
import SectionTitle from '../components/SectionTitle';
import ProgressStepper from '../components/ProgressStepper.js';
import { ConnectedState, State } from '../../lifecycle/types.js';
import { useAppLifeCycle, filterOngoingReferenda } from '../../lifecycle';
import { ReferendumOngoing } from '../../types';

const placeholderUrl = new URL(
  '../../../assets/images/temp-placeholder.png',
  import.meta.url
).toString();

function Headline() {
  return (
    <section className=" flex max-w-full flex-col items-center justify-center gap-3">
      <div className="prose mb-4 max-w-none md:prose-xl">
        <h1 className="text-center">
          Governance is now <span className="text-primary">open</span>
        </h1>
        <div className="m-auto max-w-[500px] px-3 text-center text-base">
          Not ready to do the research? Contribute without the hassle: delegate
          your votes to experts.
        </div>
      </div>
      <div className="aspect-video w-[600px] max-w-full">
        <img className="h-full w-full object-cover" src={placeholderUrl} />
      </div>
    </section>
  );
}

export function DelegatesBar() {
  // ToDo : Move Modal to a context
  const { state } = useAppLifeCycle();
  const { delegates } = state;
  const [visible, setVisible] = useState(false);
  const allTracks = tracksMetadata.map((track) => track.subtracks).flat();
  const closeModal = () => {
    setVisible(false);
  };
  const openModal = () => {
    setVisible(true);
  };
  return (
    <section className="flex w-full flex-col items-center justify-center bg-gray-200 py-12">
      <div className="prose prose-lg max-w-none pb-4 text-center">
        <h2 className="m-0">It’s on you</h2>
        <div className="mb-4 text-base">
          Contribute without the hassle: delegate your votes to experts. More
          options
        </div>
      </div>
      <div className="flex max-w-full gap-7 overflow-x-scroll px-3 pb-1 lg:px-6	">
        {delegates.map((delegate, idx) => (
          <DelegateCard
            key={idx}
            delegate={delegate}
            state={state}
            delegateHandler={openModal}
            variant="all"
          />
        ))}
      </div>
      {delegates && delegates.length > 0 && (
        <DelegateModal
          open={visible}
          onClose={closeModal}
          delegate={delegates[0]}
          tracks={allTracks}
        />
      )}
    </section>
  );
}

export const DelegateSection = () => {
  // ToDo : Move Modal to a context
  const { state } = useAppLifeCycle();
  const { delegates } = state;
  const [visible, setVisible] = useState(false);
  const { selectedTracks } = useDelegation();
  const tracks = tracksMetadata
    .map((track) => track.subtracks)
    .flat()
    .filter((track) => selectedTracks.has(track.id));
  const closeModal = () => {
    setVisible(false);
  };
  const openModal = () => {
    setVisible(true);
  };
  return (
    <>
      <div className="mb-48 mt-6 flex w-full flex-col gap-16 px-3 md:px-8">
        <SectionTitle
          title="Browse Delegates"
          description="Lorem ipsum dolor sit amet"
        >
          <ProgressStepper step={1} />
        </SectionTitle>
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex w-full flex-row items-center justify-between gap-4 lg:justify-start">
              <input
                placeholder="Search"
                className="w-full self-stretch rounded-lg bg-[#ebeaea] px-4 py-2 text-left text-sm text-black opacity-70 lg:w-fit"
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
          <div className="grid grid-cols-1 flex-wrap items-center justify-start gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {delegates?.map((delegate, idx) => (
              <DelegateCard
                key={idx}
                delegate={delegate}
                state={state}
                delegateHandler={openModal}
                variant="some"
              />
            ))}
          </div>
        </div>
        {delegates && delegates.length > 0 && (
          <DelegateModal
            open={visible}
            onClose={() => closeModal()}
            delegate={delegates[0]}
            tracks={tracks}
          />
        )}
      </div>
    </>
  );
};

function exportReferenda(state: State): Map<number, ReferendumOngoing> {
  if (state.type == 'ConnectedState') {
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
        <div ref={trackSectionRef}>
          <TrackSelect
            network={network}
            details={state.details}
            referenda={exportReferenda(state)}
            delegateHandler={() => gotoSection(delegateSectionRef)}
          />
        </div>
        <div ref={delegateSectionRef}>
          <DelegateSection />
        </div>
      </main>
    </DelegationProvider>
  );
}
