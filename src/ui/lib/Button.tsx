import type { ClickableProps } from './types.js';

export function ButtonOutline({
  children,
  className,
  style,
  onClick,
}: ClickableProps): JSX.Element {
  return (
    <button
      className={`flex min-w-min appearance-none items-center justify-center rounded-full border border-solid py-2 px-4 hover:border-primary ${
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
}: ClickableProps): JSX.Element {
  return (
    <button
      className={`flex min-w-min appearance-none items-center justify-center rounded-full bg-[#321D47] py-2 px-4 text-sm text-white  hover:scale-[1.01] ${
        className || ''
      }`}
      style={{ ...style }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
