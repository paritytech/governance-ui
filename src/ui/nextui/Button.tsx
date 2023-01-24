import React from 'react';

export function Button({
  children,
  className,
  style,
  onClick,
}: {
  children?: React.ReactNode;
  className?: string | undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  style?: React.CSSProperties | undefined;
}): JSX.Element {
  const cn = `appearance-none flex justify-center w-9 min-w-min w-auto rounded-full py-2 px-4 ${className}`;
  return (
    <button className={cn} style={{ ...style }} onClick={onClick}>
      {children}
    </button>
  );
}
