import type { BaseElementProps } from './types.js';

export function Card({
  className,
  children,
  style,
}: BaseElementProps): JSX.Element {
  return (
    <div
      className={`bg-background-float text-foreground-contrast rounded-2xl p-2 shadow ${
        className || ''
      }`}
      style={style}
    >
      {children}
    </div>
  );
}
