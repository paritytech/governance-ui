import type { BaseElementProps } from './types.js';

export function Card({
  className,
  children,
  style,
}: BaseElementProps): JSX.Element {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow ${
        className || ''
      }`}
      style={style}
    >
      {children}
    </div>
  );
}
