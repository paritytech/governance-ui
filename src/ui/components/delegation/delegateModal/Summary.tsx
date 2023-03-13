import { Delegate } from '../../../../lifecycle/types';
import { Modal, Button } from '../../../lib';
import { Accounticon } from '../../accounts/Accounticon.js';
import type { TrackType } from '../types';

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
  const {
    account: { name, address },
  } = delegate;
  const tracksCaption = tracks.map((track) => track.title).join(', ');
  const cancelHandler = () => onClose();
  const delegateHandler = () => {
    // TODO
    onClose();
  };
  return (
    <Modal size="md" open={open} onClose={() => onClose()}>
      <div className="w-full p-4 md:p-12">
        <div className=" flex flex-col items-start justify-start gap-12">
          <div className="text-left">
            <h2 className=" mb-2 text-3xl font-medium">Summary</h2>
            <p className="text-sm">
              You’re about to submit a transaction to delegate your voting power
              for the following tracks to <b>{name}</b> Delegate.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="text-xs uppercase">Your delegate</div>
            <div className="flex flex-row justify-start gap-2">
              <Accounticon
                textClassName="font-semibold"
                address={address}
                size={24}
              />
              <div className="capitalize">{name}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs uppercase">Tracks to delegate</div>
            <div className="flex flex-row justify-start gap-2">
              <div className="font-semibold">{tracksCaption}</div>
            </div>
          </div>
          <div className="flex w-full flex-row justify-end gap-4">
            <Button onClick={() => cancelHandler()}>
              <div className="flex w-full flex-nowrap items-center justify-center">
                <div>Cancel</div>
              </div>
            </Button>
            <Button onClick={() => delegateHandler()}>
              <div className="flex w-full flex-nowrap items-center justify-center">
                <div>Delegate Now</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
