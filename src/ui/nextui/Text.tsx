import React, { ReactNode } from 'react';
import { Text as NextUIText } from '@nextui-org/react';

interface Props {
  children?: ReactNode;
  h1?: boolean;
  h2?: boolean;
  h3?: boolean;
  h4?: boolean;
  h5?: boolean;
  h6?: boolean;
  b?: boolean;
  i?: boolean;
  color?: string;
  size?: number;
  css?: Record<string, any>;
}

type NativeAttrs = Omit<React.HTMLAttributes<unknown>, keyof Props>;

export type TextProps = Props & NativeAttrs;

export function Text(props: TextProps): JSX.Element {
  const {
    h1 = false,
    h2 = false,
    h3 = false,
    h4 = false,
    h5 = false,
    h6 = false,
    b = false,
    i = false,
    color,
    size,
    css,
    children,
  } = props;
  return (
    <NextUIText
      b={b}
      i={i}
      h1={h1}
      h2={h2}
      h3={h3}
      h4={h4}
      h5={h5}
      h6={h6}
      color={color}
      size={size}
      css={css}
    >
      {children}
    </NextUIText>
  );
}
