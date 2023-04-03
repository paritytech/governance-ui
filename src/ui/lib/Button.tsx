import type { ClickableProps } from './types.js';

export function ButtonOutline({
  children,
  className,
  style,
  onClick,
}: ClickableProps): JSX.Element {
  return (
    <button
      className={`flex min-w-min appearance-none items-center justify-center gap-2 rounded-full border border-solid px-4 py-2 hover:border-primary ${
        className || ''
      }`}
      style={{ ...style }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Button({
  children,
  className,
  style,
  onClick,
  ...rest
}: ClickableProps): JSX.Element {
  return (
    <button
      className={`flex min-w-min appearance-none items-center  justify-center  gap-2 rounded-full bg-primary px-4 py-2 text-sm  text-white transition-transform duration-150 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-[1] ${
        className || ''
      }`}
      style={{ ...style }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonSecondary({
  children,
  className,
  style,
  onClick,
  ...rest
}: ClickableProps): JSX.Element {
  return (
    <button
      className={`flex min-w-min appearance-none items-center justify-center  gap-2 rounded-full bg-fill-secondary px-4 py-2 text-sm text-white  transition-transform duration-150 hover:scale-[1.01] disabled:bg-gray-200 disabled:text-fg-disabled disabled:hover:scale-[1] ${
        className || ''
      }`}
      style={{ ...style }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
