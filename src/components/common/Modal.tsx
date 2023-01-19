import React from 'react';
import { Modal as NextUIModal } from '@nextui-org/react';

export function Modal({
  children,
  visible,
  width,
  onClose,
}: {
  children: React.ReactNode;
  visible: boolean;
  width: string;
  onClose: () => void;
}): JSX.Element {
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
}
