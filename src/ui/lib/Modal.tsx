import { SyntheticEvent } from 'react';
import useEscapeHandler from '../../hooks/EscapeHandler.js';
import type { BaseElementProps } from './types.js';
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalProps = BaseElementProps & {
  size?: ModalSize;
  open: boolean;
  closeOnEsc?: boolean;
  onClose: () => void;
};
const sizeClasses = {
  sm: 'w-[416px]',
  md: 'w-[640px]',
  lg: 'w-[864px]',
  xl: 'w-[1248px]',
  full: 'w-full',
};

const Modal = ({
  className,
  children,
  size,
  open,
  closeOnEsc = true,
  onClose,
}: ModalProps) => {
  size = size || 'md';

  useEscapeHandler(() => {
    closeOnEsc && onClose?.();
  });

  const closeHandler = (e: SyntheticEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <>
      {open && (
        <div
          tabIndex={-1}
          className={`fixed left-0 right-0 top-0 z-[100] flex h-full w-full animate-[fadeIn_0.23s] overflow-y-auto overflow-x-hidden bg-[rgba(0,0,0,0.85)] p-4 md:inset-0`}
          onClick={closeHandler}
        >
          <div
            className={`relative mx-auto max-w-full animate-[lift_ease-out_0.1s] self-center rounded-xl bg-white p-2 shadow-xl transition-all ${
              sizeClasses[size]
            } ${className || ''}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export { Modal };
