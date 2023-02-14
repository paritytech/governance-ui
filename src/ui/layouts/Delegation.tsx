import { DelegateCard } from '../components/DelegateCard';

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
    <div className="flex flex-col items-center justify-center py-6">
      <div className="prose prose-sm max-w-none pb-4 text-center">
        <h3 className="m-0">It’s on you</h3>
        <div className="text-base">
          Contribute without the hassle: delegate your votes to experts. More
          options
        </div>
      </div>
      <div className="flex max-w-full gap-x-7 overflow-x-auto pb-1 ">
        {delegates?.map((delegate, idx) => (
          <DelegateCard key={idx} delegate={delegate} />
        ))}
      </div>
    </div>
  );
}

export function DelegationPanel({ state, updater }) {
  return (
    <main className="flex max-w-full flex-auto flex-col items-center justify-start gap-8 pt-14 md:pt-20">
      <Headline />
      <DelegatesBar delegates={delegatesMock} />
    </main>
  );
}
