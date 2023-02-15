import { Modal } from '../../lib';
import { TrackSelect } from '../TrackSelect';
import { tracksMock } from '../../../chain/mocks';

export function DelegateModal({ open, onClose }) {
  return (
    <Modal size="xl" open={open} onClose={onClose}>
      <TrackSelect tracks={tracksMock} />
    </Modal>
  );
}
