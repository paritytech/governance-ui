import type { Delegate } from '../../../../lifecycle';

import { Modal } from '../../../lib';
import { Accounticon } from '../../accounts/Accounticon';
import { Remark } from 'react-remark';

export function DelegateInfoModal({
  delegate,
  open,
  onClose,
  children,
}: {
  delegate: Delegate;
  open: boolean;
  onClose: () => void;
  children?: JSX.Element;
}) {
  const { address, manifesto, name } = delegate;
  return (
    <Modal size="md" open={open} onClose={() => onClose()}>
      <div className="flex max-h-[90vh] w-full flex-col gap-12 p-4 md:p-12">
        <div className="flex h-full flex-col items-start justify-start gap-6 overflow-hidden ">
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-start">
              <h2 className="text-xl capitalize">{name}</h2>
              <Accounticon
                address={address}
                size={24}
                textClassName="font-semibold my-2"
                copy={true}
              />
            </div>
          </div>
          {manifesto && (
            <div className={`relative h-full overflow-auto text-base`}>
              <Remark>{manifesto}</Remark>
            </div>
          )}
        </div>
        {children}
      </div>
    </Modal>
  );
}
