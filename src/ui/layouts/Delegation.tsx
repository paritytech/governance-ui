import React, { useRef, useState } from 'react';
import { Button, ButtonOutline } from '../lib';
import {
  DelegateCard,
  DelegateAllCard,
} from '../components/delegation/DelegateCard';
import { DelegateModal } from '../components/delegation/delegateModal/Summary';
import { TrackSelect, CheckBox } from '../components/delegation/TrackSelect';
import { tracksMetadata, delegatesMock } from '../../chain/mocks';
import { CaretDownIcon, CaretRightIcon, PlusIcon } from '../icons';
import { DelegationProvider, useDelegation } from '../../contexts/Delegation';
import { DelegateType } from '../components/delegation/types';
import ProgressStepper from '../components/ProgressStepper';

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
        <div className="m-auto max-w-[500px] text-center text-base">
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

export function DelegatesBar({ delegates }: { delegates: DelegateType[] }) {
  // ToDo : Move Modal to a context
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
      <div className="flex max-w-full gap-x-7 overflow-x-scroll px-6 pb-1">
        {delegates?.map((delegate, idx) => (
          <DelegateAllCard
            key={idx}
            delegate={delegate}
            delegateHandler={() => openModal()}
          />
        ))}
      </div>
      <DelegateModal
        open={visible}
        onClose={() => closeModal()}
        delegate={delegates[0]}
        tracks={allTracks}
      />
    </section>
  );
}

export function TrackSelectSection({
  delegateHandler,
}: {
  delegateHandler: () => void;
}) {
  return (
    <div className="mb-16 flex w-full flex-col gap-4 px-2 md:px-8">
      <div className="items-top flex justify-between">
        <div className="prose prose-sm max-w-none pb-4">
          <h2 className="mb-2">Delegate by track</h2>
          <div className="text-base">
            There are currently 11 active proposals on 5 tracks.
          </div>
        </div>
        <ProgressStepper step={0} />
      </div>
      <div className="mb-4 flex flex-row justify-between">
        <CheckBox background title="All tracks" />
        <Button onClick={() => delegateHandler()}>
          <div className="flex flex-row items-center justify-center gap-1">
            <div>Delegate Tracks</div>
            <CaretRightIcon />
          </div>
        </Button>
      </div>
      <TrackSelect expanded />
    </div>
  );
}

export const DelegateSection = ({
  delegates,
}: {
  delegates: DelegateType[];
}) => {
  // ToDo : Move Modal to a context
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
      <div className="flex w-full flex-col gap-y-6 px-2 pb-6 md:px-8">
        <div className="items-top flex justify-between">
          <div className="prose prose-sm  pb-4">
            <h2 className="mb-2">Select Delegates</h2>
            <div className="text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
          </div>
          <ProgressStepper step={1} />
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center justify-between gap-4">
            <ButtonOutline>
              <div className="flex flex-row items-center justify-center gap-1">
                <div>Aggregate Best</div>
                <CaretDownIcon />
              </div>
            </ButtonOutline>
            <ButtonOutline>
              <div className="flex flex-row items-center justify-center gap-1">
                <div>Status</div>
                <CaretDownIcon />
              </div>
            </ButtonOutline>
          </div>
          <div className="flex flex-row items-center justify-between gap-4">
            <ButtonOutline>
              <div className="flex flex-row items-center justify-center gap-1">
                <PlusIcon />
                <div>Add address</div>
              </div>
            </ButtonOutline>
            <input
              placeholder="Search"
              className="w-[200px] self-stretch rounded-lg bg-[#ebeaea] px-4 py-2 text-left text-sm text-black opacity-70"
            />
          </div>
        </div>
        <div className="flex flex-row flex-wrap items-center justify-start gap-y-4 gap-x-7">
          {delegates?.map((delegate, idx) => (
            <DelegateCard
              key={idx}
              delegate={delegate}
              delegateHandler={() => openModal()}
            />
          ))}
        </div>
        <DelegateModal
          open={visible}
          onClose={() => closeModal()}
          delegate={delegates[0]}
          tracks={tracks}
        />
      </div>
    </>
  );
};

export function DelegationPanel() {
  const delegateSectionRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);
  const gotoDelegateSection = () => {
    delegateSectionRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <DelegationProvider>
      <main className="flex max-w-full flex-auto flex-col items-center justify-start gap-8 pt-14 md:pt-20">
        <Headline />
        <DelegatesBar delegates={delegatesMock} />
        <TrackSelectSection delegateHandler={() => gotoDelegateSection()} />
        <div ref={delegateSectionRef}>
          <DelegateSection delegates={delegatesMock} />
        </div>
      </main>
    </DelegationProvider>
  );
}
