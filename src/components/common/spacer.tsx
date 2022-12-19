import React from 'react';
import { Spacer as NextUISpacer } from '@nextui-org/react';

function Spacer({ x = 1, y = 1 }: { x?: number; y?: number }): JSX.Element {
  return <NextUISpacer x={x} y={y} />;
}

export default Spacer;
