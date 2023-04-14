import { MessageIcon, PolkadotCircleIcon } from '../icons';

export default function Footer() {
  return (
    <div className="fixed bottom-0 flex h-fit w-full items-center justify-between bg-white/50 p-2 text-[0.625rem] backdrop-blur-md">
      <div className="flex items-center gap-2">
        <PolkadotCircleIcon />
        <span>© Web3 Foundation</span>
        <div className="h-3 w-[1px] bg-gray-500" />
        <a href="" target="_blank" className=" underline">
          Privacy Policy
        </a>
      </div>
      <div className="flex items-center gap-2">
        <MessageIcon size="14" />
        <a
          href="https://polkadot-governance-ui.canny.io/feedback"
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
