import { createTheme, NextUIProvider } from '@nextui-org/react';

export { Button, Colors } from './Button.js';
export { Card } from './Card.js';
export * from './Icons.js';
export { Loading } from './Loading.js';
export { Modal } from './Modal.js';
export { Navbar } from './Navbar.js';
export { Spacer } from './Spacer.js';
export { Text } from './Text.js';

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
