import type { BaseElementProps } from './types.js';
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalProps = BaseElementProps & {
  size?: ModalSize;
  open: boolean;
  onClose: () => void;
};
const sizeClasses = {
  sm: 'w-[416px]',
  md: 'w-[640px]',
  lg: 'w-[864px]',
  xl: 'w-[1248px]',
  full: 'w-full',
};

const Modal = ({ className, children, size, open, onClose }: ModalProps) => {
  size = size || 'md';
  return (
    <>
      {open && (
        <div
          tabIndex={-1}
          className={`fixed top-0 left-0 right-0 z-50  flex h-full w-full overflow-y-auto overflow-x-hidden p-4 backdrop-blur  md:inset-0`}
          onClick={onClose && (() => onClose())}
        >
          <div
            className={`relative  mx-auto max-w-full self-center rounded-lg bg-white p-2 shadow ${
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
