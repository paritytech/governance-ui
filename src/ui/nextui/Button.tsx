import React from 'react';

export function Button({
  children,
  className,
  style,
  onClick,
  ...rest
}: {
  children?: React.ReactNode;
  className?: string | undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  style?: React.CSSProperties | undefined;
}): JSX.Element {
  return (
    <button
      className={`flex w-9 w-auto min-w-min appearance-none justify-center rounded-full border-primary py-2 px-4 ${className}`}
      style={{ ...style }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
