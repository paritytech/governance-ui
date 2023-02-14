import type { BaseElementProps } from './types.js';

export function Card({
  className,
  children,
  style,
}: BaseElementProps): JSX.Element {
  return (
    <div
      className={`rounded-lg bg-white p-2 shadow ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
