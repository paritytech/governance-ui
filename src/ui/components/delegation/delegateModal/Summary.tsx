import { ChevronRightIcon, CloseIcon } from '../../../icons';
import { Modal, Button, ButtonSecondary } from '../../../lib';
import { Delegate } from '../../../../lifecycle/types';

import { Accounticon } from '../../accounts/Accounticon.js';
import type { TrackType } from '../types';
import { SimpleAnalytics } from '../../../../analytics';

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
    // TODO: submit delegate tx

    // Submit analytics
    SimpleAnalytics.track('Delegate');

    // close modal
    onClose();
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
          <ButtonSecondary onClick={() => cancelHandler()}>
            <CloseIcon />
            <div>Cancel</div>
          </ButtonSecondary>
          <Button onClick={() => delegateHandler()}>
            <div>Delegate Now</div>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
