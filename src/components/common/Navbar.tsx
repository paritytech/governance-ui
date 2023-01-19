import { Navbar as NextUINavbar } from '@nextui-org/react';
import { Text } from '.';

export function Navbar({ title, children }: { title: string, children: React.ReactNode }): JSX.Element {
  return (
    <NextUINavbar variant="static" maxWidth="xl">
      <NextUINavbar.Brand>
        <Text b color="inherit">
          {title}
        </Text>
      </NextUINavbar.Brand>
      <NextUINavbar.Content>
        <NextUINavbar.Item>
          {children}
        </NextUINavbar.Item>
      </NextUINavbar.Content>
    </NextUINavbar>
  );
}
