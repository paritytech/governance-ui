import React from 'react';
import { Modal as NextUIModal } from '@nextui-org/react';

const Modal = ({
  children,
  visible,
  width,
  onClose,
}: {
  children: React.ReactNode;
  visible: boolean;
  width: number | string;
  onClose: () => void;
}) => {
  return (
    <div>
      <NextUIModal
        scroll
        width={width}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        open={visible}
        onClose={onClose}
      >
        <NextUIModal.Body>{children}</NextUIModal.Body>
      </NextUIModal>
    </div>
  );
};

export default Modal;
