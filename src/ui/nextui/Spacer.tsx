import { BaseElementProps } from './types';

export function Spacer({ className, style }: BaseElementProps): JSX.Element {
  return (
    <hr
      className={`my-8 h-px border-0 bg-gray-200 dark:bg-gray-700 ${className}`}
      style={style}
    />
  );
}
