import { Spacer as NextUISpacer } from '@nextui-org/react';

export function Spacer({
  x = 1,
  y = 1,
}: {
  x?: number;
  y?: number;
}): JSX.Element {
  return <NextUISpacer x={x} y={y} />;
}
