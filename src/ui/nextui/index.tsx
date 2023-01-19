import { createTheme, NextUIProvider } from '@nextui-org/react';

export { Button, Colors } from './Button';
export { Card } from './Card';
export * from './Icons';
export { Loading } from './Loading';
export { Modal } from './Modal';
export { Navbar } from './Navbar';
export { Spacer } from './Spacer';
export { Text } from './Text';

const theme = createTheme({
  type: 'light',
  theme: {
    fonts: {
      sans: 'Unbounded',
    },
    colors: {
      primary: '#e6007a',
    },
  },
});

export function UIProvider({
  children,
}: {
  children?: React.ReactNode;
}): JSX.Element {
  return <NextUIProvider theme={theme}>{children}</NextUIProvider>;
}
