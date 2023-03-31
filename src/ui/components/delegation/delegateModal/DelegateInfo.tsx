import type { Delegate } from 'src/lifecycle';

import { Modal } from '../../../lib';
import { RoleTag } from '../common/RoleTag';
import { Accounticon } from '../../accounts/Accounticon';
import { extractRoles, useAppLifeCycle } from '../../../../lifecycle';
import { Remark } from 'react-remark';

export function DelegateInfoModal({
  delegate,
  open,
  onClose,
}: {
  delegate: Delegate;
  open: boolean;
  onClose: () => void;
}) {
  const { state } = useAppLifeCycle();
  const { address, manifesto, name } = delegate;
  const roles = extractRoles(address, state);
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
              />
            </div>
          </div>
          <div className="flex gap-2">
            {roles.map((role) => (
              <RoleTag key={role} role={role} />
            ))}
          </div>
          <div className={`relative h-full overflow-auto text-base`}>
            <Remark>{manifesto}</Remark>
          </div>
        </div>
      </div>
    </Modal>
  );
}
