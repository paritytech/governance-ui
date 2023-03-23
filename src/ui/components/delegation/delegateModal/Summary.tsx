import BN from 'bn.js';
import { ChevronRightIcon, CloseIcon } from '../../../icons';
import { Modal, Button, ButtonSecondary } from '../../../lib';
import { useAppLifeCycle } from '../../../../lifecycle';
import { Delegate, State } from '../../../../lifecycle/types';
import { Accounticon } from '../../accounts/Accounticon.js';
import type { TrackType } from '../types';
import { Conviction } from '../../../../types';
import { SimpleAnalytics } from '../../../../analytics';
import { SigningAccount, useAccount } from '../../../.././contexts';
import { signAndSend } from '../../../../utils/polkadot-api';

function extractBalance(state: State): BN | undefined {
  if (state.type == 'ConnectedState') {
    return state.account?.balance;
  }
}

interface IDelegateModalProps {
  delegate: Delegate;
  tracks: TrackType[];
  open: boolean;
  onClose: () => void;
}
export function DelegateModal({
  delegate,
  tracks,
  open,
  onClose,
}: IDelegateModalProps) {
  const { state, updater } = useAppLifeCycle();
  const { connectedAccount } = useAccount();
  const balance = extractBalance(state);
  const { name, address } = delegate;
  const tracksCaption = tracks.map((track) => track.title).join(', ');
  const cancelHandler = () => onClose();
  const delegateHandler = async (
    { account: { address }, signer }: SigningAccount,
    balance: BN
  ) => {
    try {
      // Use a default conviction voting for now
      const txs = await updater.delegate(
        address,
        tracks.map((track) => track.id),
        balance,
        Conviction.None
      );
      if (txs.type == 'ok') {
        await signAndSend(address, signer, txs.value);

        SimpleAnalytics.track('Delegate');
      }
    } finally {
      // close modal
      onClose();
    }
  };
  return (
    <Modal size="md" open={open} onClose={() => onClose()}>
      <div className="flex w-full flex-col gap-12 p-4 md:p-12">
        <div className="flex flex-col items-start justify-start gap-6 ">
          <div className="text-left">
            <h2 className="mb-2 text-3xl font-medium">Summary</h2>
            <p className="text-base">
              You’re about to submit a transaction to delegate your voting power
              for the following tracks to <b>{name}</b> Delegate.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm">Your delegate</div>
            <div className="flex gap-2">
              <Accounticon
                textClassName="font-medium"
                address={address}
                size={24}
              />
              <div className="capitalize">{name}</div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm">Tracks to delegate</div>
            <div className="flex gap-2">
              <div className="text-base font-medium">{tracksCaption}</div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-row justify-end gap-4">
          <ButtonSecondary onClick={cancelHandler}>
            <CloseIcon />
            <div>Cancel</div>
          </ButtonSecondary>
          {connectedAccount &&
            balance && ( // Check for non-null balance?
              // TODO Probably better to allow for button to be disabled
              <Button
                onClick={() => delegateHandler(connectedAccount, balance)}
              >
                <div>Delegate Now</div>
                <ChevronRightIcon />
              </Button>
            )}
        </div>
      </div>
    </Modal>
  );
}
