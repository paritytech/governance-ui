import type { ClickableProps } from './types.js';

type ViariantType = 'primary' | 'secondary' | 'outline' | 'ghost';

function variantStyles(type: ViariantType, disabled = false): string {
  switch (type) {
    case 'primary':
      return `flex min-w-min appearance-none items-center  justify-center  gap-2 rounded-full bg-fill-primary ${
        !disabled
          ? 'hover:bg-fill-primary-hover active:bg-fill-primary-pressed'
          : ''
      } px-4 py-2 text-sm  text-white disabled:opacity-50 `;
    case 'secondary':
      return `flex min-w-min appearance-none items-center justify-center  gap-2 rounded-full bg-fill-secondary ${
        !disabled
          ? 'hover:bg-fill-secondary-hover active:bg-fill-secondary-pres'
          : ''
      } px-4 py-2 text-sm text-white  disabled:bg-gray-200 disabled:text-fg-disabled`;
    case 'outline':
      return `flex min-w-min appearance-none items-center justify-center gap-2 rounded-full border border-solid px-4 py-2 ${
        !disabled ? 'hover:border-primary' : ''
      } disabled:text-fg-disabled`;
    case 'ghost':
      return `flex min-w-min appearance-none items-center bg-white/70 justify-center gap-2 rounded-full px-4 py-2 ${
        !disabled ? 'hover:bg-white' : ''
      } disabled:bg-white/70 disabled:text-fg-disabled `;
  }
}

export function Button({
  children,
  style,
  onClick,
  variant = 'secondary',
  className,
  disabled,
  ...rest
}: ClickableProps & { variant?: ViariantType }): JSX.Element {
  return (
    <button
      className={`${variantStyles(variant, disabled)} ${className}`}
      style={{ ...style }}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
