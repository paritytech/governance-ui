const placeholderUrl = new URL(
  '../../../assets/images/temp-placeholder.png',
  import.meta.url
).toString();

export default function Headline() {
  return (
    <div className=" flex max-w-full flex-col items-center justify-center gap-24">
      <div className="flex flex-col items-center gap-0">
        <span className="text-center font-unbounded text-h1">
          Governance is now <span className="text-primary">open</span>
        </span>
        <span className="px-3 text-center text-body">
          No time to vote? Keep Polkadot running smoothly by delegating to an
          expert instead.
        </span>
      </div>
      <div className="flex w-[640px] flex-col gap-12">
        <div className="flex items-center gap-8">
          <div className="h-[160px] w-[210px] rounded-md bg-gray-200" />
          <div className="flex w-full flex-col gap-1">
            <span className="text-h6 font-semibold">Make your vote count</span>
            <span className="text-body">
              Through Polkadot OpenGov, all DOT holders can participate in
              governance. You can also appoint a representative with advanced
              expertise to delegate your votes to, as and when you please.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex w-full flex-col gap-1">
            <span className="text-h6 font-semibold">
              Engage in governance, when it suits you
            </span>
            <span className="text-body">
              Even when delegating your vote, you remain in full control. At any
              time, you can change delegates or take back your voting power
              completely.
            </span>
          </div>
          <div className=" h-[160px] w-[210px] rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
