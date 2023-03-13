import { ClickableProps } from '../../../ui/lib/types';

export function ConnectCard({
  className,
  children,
  style,
  onClick,
}: ClickableProps): JSX.Element {
  return (
    <div
      className={`rounded-lg bg-gray-100 ${className || ''}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
