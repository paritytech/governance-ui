import type { ClickableProps } from './types.js';

export function ButtonOutline({
  children,
  className,
  style,
  onClick,
}: ClickableProps): JSX.Element {
  return (
    <button
      className={`flex min-w-min appearance-none items-center justify-center gap-2 rounded-full border border-solid py-2 px-4 hover:border-primary ${
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
      className={`flex min-w-min appearance-none items-center  justify-center  gap-2 rounded-full bg-primary py-2 px-4 text-sm  text-white transition-transform duration-150 hover:scale-[1.01] ${
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
      className={`flex min-w-min appearance-none items-center  justify-center gap-2 rounded-full bg-secondary py-2 px-4 text-sm  text-white transition-transform duration-150 hover:scale-[1.01] ${
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
