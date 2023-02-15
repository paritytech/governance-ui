import { DelegateCard } from '../components/DelegateCard';
import { Card, Button } from '../lib';

const placeholderUrl = new URL(
  '../../../assets/images/temp-placeholder.png',
  import.meta.url
).toString();

const delegatesMock = [
  {
    account: {
      name: 'hamid',
      address: '128iGaUF4zV1L2bXtAH9UmocvqpSLrJFL5TxZYZkjoSf16Hv',
    },
    roles: ['nominatoe', 'fellow', 'validator'],
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel facilisis augue. Praesent nec imperdiet diam. Etiam tempus convallis sollicitudin. Read more',
    stats: [
      { title: 'Most active track', value: 'Staking admin' },
      { title: 'Participation', value: '75.71%' },
      { title: 'Representing', value: '135 addresses' },
      { title: 'DOT', value: '24k DOT' },
    ],
  },
  {
    account: {
      name: 'hamid',
      address: '128iGaUF4zV1L2bXtAH9UmocvqpSLrJFL5TxZYZkjoSf16Hv',
    },
    roles: ['nominatoe', 'fellow', 'validator'],
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel facilisis augue. Praesent nec imperdiet diam. Etiam tempus convallis sollicitudin. Read more',
    stats: [
      { title: 'Most active track', value: 'Staking admin' },
      { title: 'Participation', value: '75.71%' },
      { title: 'Representing', value: '135 addresses' },
      { title: 'DOT', value: '24k DOT' },
    ],
  },
  {
    account: {
      name: 'hamid',
      address: '128iGaUF4zV1L2bXtAH9UmocvqpSLrJFL5TxZYZkjoSf16Hv',
    },
    roles: ['nominatoe', 'fellow', 'validator'],
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel facilisis augue. Praesent nec imperdiet diam. Etiam tempus convallis sollicitudin. Read more',
    stats: [
      { title: 'Most active track', value: 'Staking admin' },
      { title: 'Participation', value: '75.71%' },
      { title: 'Representing', value: '135 addresses' },
      { title: 'DOT', value: '24k DOT' },
    ],
  },
  {
    account: {
      name: 'hamid',
      address: '128iGaUF4zV1L2bXtAH9UmocvqpSLrJFL5TxZYZkjoSf16Hv',
    },
    roles: ['nominatoe', 'fellow', 'validator'],
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel facilisis augue. Praesent nec imperdiet diam. Etiam tempus convallis sollicitudin. Read more',
    stats: [
      { title: 'Most active track', value: 'Staking admin' },
      { title: 'Participation', value: '75.71%' },
      { title: 'Representing', value: '135 addresses' },
      { title: 'DOT', value: '24k DOT' },
    ],
  },
];

const tracksMock = [
  {
    title: 'Admin',
    subtracks: [
      {
        title: 'Root',
        description: 'Root is the track for the most important things',
      },
      {
        title: 'Auction Admin',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis dui vitae leo aliquam iaculis. Maecenas faucibus nisi id lacus lacinia ornare. Phasellus in eros dignissim',
      },
      {
        title: 'Staking Admin',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis dui vitae leo aliquam iaculis. Maecenas faucibus nisi id lacus lacinia ornare. Phasellus in eros dignissim',
      },
    ],
  },
  {
    title: 'Governance',
    subtracks: [
      {
        title: 'Lease Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      },
      {
        title: 'General Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Referendum Canceler',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Referendum Killer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
  },
  {
    title: 'Treasury',
    subtracks: [
      {
        title: 'Small Tipper',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Big Tipper',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Small Spender',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Medium Spender',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Big Spender',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Treasurer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
  },
  {
    title: 'Fellowship',
    subtracks: [
      {
        title: 'Whitelisted Caller',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Members',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Member Referenda',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        title: 'Fellowship Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
  },
];

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
          <DelegateCard key={idx} delegate={delegate} />
        ))}
      </div>
    </div>
  );
}

export function CheckBox({ title }) {
  const checkboxId = `${title}-checkbox`;
  return (
    <div className="flex items-center">
      <input
        id={checkboxId}
        type="checkbox"
        value=""
        className="h-4 w-4 rounded-lg border border-primary bg-gray-100 accent-primary"
      />
      <label
        htmlFor={checkboxId}
        className="ml-2 text-sm font-semibold text-gray-900"
      >
        {title}
      </label>
    </div>
  );
}
export function TrackCheckableCard({ track }) {
  return (
    <Card>
      <div className="flex flex-col gap-2 p-4">
        <CheckBox title={track.title} />
        <div className="text-sm leading-tight">{track.description}</div>
      </div>
    </Card>
  );
}

export function TrackSelect({ tracks }) {
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
      <div className="flex w-full flex-col justify-between md:flex-row">
        {tracks.map((track, idx) => (
          <div key={idx} className="mt-4 flex w-full flex-col gap-2 md:w-1/4">
            <div className="px-2 uppercase">{track.title}</div>
            <div className="flex flex-row border-t md:flex-col">
              {track.subtracks.map((subtrack, idx) => (
                <TrackCheckableCard key={idx} track={subtrack} />
              ))}
            </div>
          </div>
        ))}{' '}
      </div>
    </div>
  );
}

export function DelegationPanel({ state, updater }) {
  return (
    <main className="flex max-w-full flex-auto flex-col items-center justify-start gap-8 pt-14 md:pt-20">
      <Headline />
      <DelegatesBar delegates={delegatesMock} />
      <TrackSelect tracks={tracksMock} />
    </main>
  );
}
