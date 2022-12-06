import React, { useState } from 'react';
import { Modal as NextUIModal } from '@nextui-org/react';

const Modal = ({
  children,
  visible,
  onClose,
}: {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
}) => {
  return (
    <div>
      <NextUIModal
        scroll
        width="600px"
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
