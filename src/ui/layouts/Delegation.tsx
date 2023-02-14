import { DelegateCard } from '../components/DelegateCard';

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

function Delegates() {
  return (
    <>
      <DelegateCard
        delegate={{
          account: {
            name: 'hamid',
            address: '128iGaUF4zV1L2bXtAH9UmocvqpSLrJFL5TxZYZkjoSf16Hv',
          },
        }}
      />
    </>
  );
}

export function DelegationPanel({ state, updater }) {
  return (
    <main className="flex max-w-full flex-auto flex-col items-center justify-start gap-8 pt-14 md:pt-20">
      <Headline />
      <Delegates />
    </main>
  );
}
