import type { ClickableProps } from './types.js';

export function ButtonOutline({
  children,
  className,
  style,
  onClick,
}: ClickableProps): JSX.Element {
  return (
    <button
      className={`flex w-9 w-auto min-w-min appearance-none items-center justify-center justify-center rounded-full border border-solid py-2 px-4 hover:border-primary ${
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
      className={`m-2 flex w-9 w-auto min-w-min appearance-none items-center justify-center justify-center rounded-full bg-primary py-2 px-4 text-white hover:scale-[1.01] ${
        className || ''
      }`}
      style={{ ...style }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
