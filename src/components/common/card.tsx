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
  css,
}: {
  className?: string;
  header?: ReactNode;
  children: ReactNode;
}): JSX.Element {
  return (
    <NextUICard className={className} css={css} variant={'bordered'}>
      <HeaderWrapper header={header} />
      <NextUICard.Body>{children}</NextUICard.Body>
    </NextUICard>
  );
}
