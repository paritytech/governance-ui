import type { ClickableProps } from './types';

export function Button({
  children,
  className,
  style,
  onClick,
}: ClickableProps): JSX.Element {
  return (
    <button
      className={`flex w-9 w-auto min-w-min appearance-none justify-center rounded-full border border-solid border-primary py-2 px-4 ${className}`}
      style={{ ...style }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
