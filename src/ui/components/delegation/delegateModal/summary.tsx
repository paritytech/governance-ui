import { Modal, Button } from '../../../lib';
import { Accounticon } from '../../Accounticon';

export function DelegateModal({ delegate, tracks, open, onClose }) {
  const { account } = delegate;
  const tracksCaption = tracks.map((track) => track.title).join(', ');
  const cancelHandler = () => onClose();
  const delegateHandler = () => {
    console.log('submit delegate Tx');
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
              for the following tracks to Daria Delegate.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="text-xs uppercase">Your delegate</div>
            <div className="flex flex-row justify-start gap-2">
              <Accounticon
                textClassName="font-semibold"
                address={account?.address}
                size={24}
              />
              <div className="capitalize">{account?.name}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs uppercase">Tracks to delegate</div>
            <div className="flex flex-row justify-start gap-2">
              <div className="font-semibold">{tracksCaption}</div>
            </div>
          </div>
          <div className="flex w-full flex-row justify-end">
            <Button onClick={() => cancelHandler()}>
              <div className="flex w-full flex-nowrap items-center justify-center">
                <div>{'<'}</div>
                <div>Cancel</div>
              </div>
            </Button>
            <Button onClick={() => delegateHandler()}>
              <div className="flex w-full flex-nowrap items-center justify-center">
                <div>{'>'}</div>
                <div>Delegate Now</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
