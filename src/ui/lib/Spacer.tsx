import type { BaseElementProps } from './types';

export function Spacer({ className, style }: BaseElementProps): JSX.Element {
  return (
    <hr
      className={`my-8 h-px border-0 bg-gray-200 ${className || ''}`}
      style={style}
    />
  );
}
