import React, { ReactNode } from 'react';
import { Card as NextUICard } from '@nextui-org/react';

function HeaderWrapper({ header }: { header?: ReactNode }): JSX.Element {
  if (header) {
    return (
      <>
        {header}
        <NextUICard.Divider />
      </>
    );
  }
  return <></>;
}

export function Card({
  className,
  header,
  children,
}: {
  className?: string;
  header?: ReactNode;
  children: ReactNode;
  bodyCss?: any;
}): JSX.Element {
  return (
    <NextUICard className={className} variant={'bordered'}>
      <HeaderWrapper header={header} />
      <NextUICard.Body>{children}</NextUICard.Body>
    </NextUICard>
  );
}
