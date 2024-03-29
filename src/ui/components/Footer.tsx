import { MessageIcon, PolkadotCircleIcon } from '../icons';

export default function Footer() {
  return (
    <div className="fixed bottom-0 flex h-fit w-full items-center justify-between bg-white/50 p-2 text-[0.625rem] backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <PolkadotCircleIcon />
        <span>© Web3 Foundation</span>
        <div className="h-3 w-[1px] bg-gray-500" />
        <a
          href="https://polkadot.network/privacy/"
          target="_blank"
          className=" underline"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        <div className="h-3 w-[1px] bg-gray-500" />
        <a
          href="https://polkadot.network/legal-disclosures/"
          target="_blank"
          className=" underline"
          rel="noreferrer"
        >
          Legal Disclosures
        </a>
      </div>
      <div className="flex items-center gap-2">
        <MessageIcon size="14" />
        <a
          href="https://github.com/paritytech/governance-ui/discussions"
          target="_blank"
          className=" underline"
          rel="noreferrer"
        >
          Feedback
        </a>
      </div>
    </div>
  );
}
