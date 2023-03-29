import type { TrackType } from '../types';
import type { SigningAccount, VotingDelegating } from '../../../../types';

import { ChevronRightIcon, CloseIcon } from '../../../icons';
import { Modal, Button, ButtonSecondary } from '../../../lib';
import { useAppLifeCycle, extractBalance } from '../../../../lifecycle';
import { Accounticon } from '../../accounts/Accounticon.js';
import { SimpleAnalytics } from '../../../../analytics';
import { useAccount } from '../../../../contexts';
import { signAndSend } from '../../../../utils/polkadot-api';

interface IUndelegateModalProps {
  delegation: VotingDelegating;
  tracks: TrackType[];
  open: boolean;
  onClose: () => void;
}
export function UndelegateModal({
  delegation,
  tracks,
  open,
  onClose,
}: IUndelegateModalProps) {
  const { state, updater } = useAppLifeCycle();
  const { connectedAccount } = useAccount();
  const balance = extractBalance(state);
  const { target: address } = delegation;
  const tracksCaption = tracks.map((track) => track.title).join(', ');
  const cancelHandler = () => onClose();
  const undelegateHandler = async ({
    account: { address },
    signer,
  }: SigningAccount) => {
    try {
      const txs = await updater.undelegate(tracks.map((track) => track.id));
      if (txs.type == 'ok') {
        await signAndSend(address, signer, txs.value);
        SimpleAnalytics.track('Undelegate');
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
              Submitting this transaction will undelegate the following tracks:
            </p>
          </div>
          <div className="columns-2">
            <div className="flex w-full flex-col gap-1">
              <div className="text-sm">Tracks to undelegate</div>
              <div className="flex gap-2">
                <div className="text-base font-medium">{tracksCaption}</div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-1">
              <div className="text-sm">Your delegate</div>
              <div className="flex gap-2">
                <Accounticon
                  textClassName="font-medium"
                  address={address}
                  size={24}
                />
              </div>
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
              <Button onClick={() => undelegateHandler(connectedAccount)}>
                <div>Undelegate Tracks</div>
                <ChevronRightIcon />
              </Button>
            )}
        </div>
      </div>
    </Modal>
  );
}
