import { useState } from 'react';
import { Button, Modal } from '../../../lib';
import { ChevronRightIcon, CloseIcon } from '../../../icons';
import { useAppLifeCycle } from '../../../../lifecycle';
import { isValidAddress } from '../../../../utils/polkadot-api';

export function AddDelegateModal({
  open,
  onAddressValidated,
  onClose,
}: {
  open: boolean;
  onAddressValidated: (address: string) => void;
  onClose: () => void;
}) {
  const { updater } = useAppLifeCycle();
  const [address, setAddress] = useState<string>();
  const cancelHandler = () => onClose();

  return (
    <Modal size="md" open={open} onClose={() => onClose()}>
      <div className="flex w-full flex-col gap-12 p-4 md:p-12">
        <div className="flex flex-col items-start justify-start gap-6">
          <div className="text-left">
            <h2 className="mb-2 text-3xl font-medium">Add a delegate</h2>
            <p className="text-base">
              Don&apos;t see your delegate in the list? No problem, add them
              below.
            </p>
          </div>
          <div className="flex w-full flex-col">
            <label htmlFor="address" className="flex items-center py-2 text-sm">
              Delegate Address
            </label>
            <input
              id="address"
              placeholder="Polkadot Address"
              className="w-full self-stretch rounded-lg bg-[#ebeaea] px-4 py-2 text-left text-sm text-black opacity-70"
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full flex-row justify-end gap-4">
          <Button onClick={cancelHandler}>
            <CloseIcon />
            <div>Cancel</div>
          </Button>
          <Button
            onClick={() => {
              if (address) {
                onAddressValidated(address);
                updater.addCustomDelegate({ address });
              }
            }}
            disabled={!(address && isValidAddress(address))}
          >
            <div>Add delegate</div>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
