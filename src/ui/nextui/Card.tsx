import { BaseElementProps } from './types';

export function Card({
  className,
  children,
  style,
}: BaseElementProps): JSX.Element {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
