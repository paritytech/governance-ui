import { useState } from 'react';
import { Button } from '../lib';
import { DelegateCard } from '../components/DelegateCard';
import { DelegateModal } from '../components/DelegateModal';
import { TrackSelect, CheckBox } from '../components/TrackSelect';
import { tracksMock, delegatesMock } from '../../chain/mocks';

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

export function DelegatesBar({ delegates }) {
  // ToDo : Move Modal to a context
  const [visible, setVisible] = useState(false);
  const closeModal = () => {
    setVisible(false);
  };
  const openModal = () => {
    setVisible(true);
  };
  return (
    <div className="flex w-full flex-col items-center justify-center py-6">
      <div className="prose prose-sm max-w-none pb-4 text-center">
        <h3 className="m-0">It’s on you</h3>
        <div className="text-base">
          Contribute without the hassle: delegate your votes to experts. More
          options
        </div>
      </div>
      <div className="flex max-w-full gap-x-7 overflow-x-scroll pb-1 ">
        {delegates?.map((delegate, idx) => (
          <DelegateCard
            key={idx}
            delegate={delegate}
            delegateHandler={() => openModal()}
          />
        ))}
      </div>
      <DelegateModal open={visible} onClose={() => closeModal()} />
    </div>
  );
}
export function TrackSelectSection({ tracks }) {
  return (
    <div className="flex w-full flex-col px-2 md:px-4">
      <div className="prose prose-sm max-w-none pb-4">
        <h2 className="mb-2">Delegate by track</h2>
        <div className="text-base">
          There are currently 11 active proposals on 5 tracks.
        </div>
      </div>
      <div className="flex flex-row justify-between px-2">
        <CheckBox title="All tracks" />
        <Button>Delegate Tracks</Button>
      </div>
      <TrackSelect tracks={tracks} expanded />
    </div>
  );
}

export function DelegationPanel({ state, updater }) {
  return (
    <main className="flex max-w-full flex-auto flex-col items-center justify-start gap-8 pt-14 md:pt-20">
      <Headline />
      <DelegatesBar delegates={delegatesMock} />
      <TrackSelectSection tracks={tracksMock} />
    </main>
  );
}
