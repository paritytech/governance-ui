import { ReactNode } from 'react';
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
  variant,
}: {
  className?: string;
  header?: ReactNode;
  children: ReactNode;
  variant?: 'bordered' | 'shadow' | 'flat';
}): JSX.Element {
  return (
    <NextUICard className={className} variant={variant || 'bordered'}>
      <HeaderWrapper header={header} />
      <NextUICard.Body className='flex flex-auto flex-col items-center justify-center'>{children}</NextUICard.Body>
    </NextUICard>
  );
}
