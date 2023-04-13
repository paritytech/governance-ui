import type { ClickableProps } from './types.js';

type ViariantType = 'primary' | 'secondary' | 'outline' | 'ghost';

const variantStyles = {
  primary: `flex min-w-min appearance-none items-center  justify-center  gap-2 rounded-full bg-fill-primary hover:bg-fill-primary-hover active:bg-fill-primary-pressed px-4 py-2 text-sm  text-white disabled:opacity-50 `,
  secondary: `flex min-w-min appearance-none items-center justify-center  gap-2 rounded-full bg-fill-secondary hover:bg-fill-secondary-hover active:bg-fill-secondary-pres px-4 py-2 text-sm text-white  disabled:bg-gray-200 disabled:text-fg-disabled`,
  outline: `flex min-w-min appearance-none items-center justify-center gap-2 rounded-full border border-solid px-4 py-2 hover:border-primary disabled:text-fg-disabled`,
  ghost: `flex min-w-min appearance-none items-center bg-white/70 justify-center gap-2 rounded-full px-4 py-2 hover:bg-white disabled:bg-white/70 disabled:text-fg-disabled `,
};

export function Button({
  children,
  style,
  onClick,
  variant,
  className,
  ...rest
}: ClickableProps & { variant?: ViariantType }): JSX.Element {
  const variantClassName = variant
    ? variantStyles[variant]
    : variantStyles['secondary'];
  return (
    <button
      className={`${variantClassName} ${className}`}
      style={{ ...style }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
