import React from 'react';
import { Button as NextUIButton } from '@nextui-org/react';

enum Colors {
  default,
  primary,
  secondary,
  success,
  warning,
  error,
}

function Button({
  children,
  color,
  icon,
  onPress,
}: {
  children: React.ReactNode;
  color: keyof typeof Colors;
  icon?: React.ReactNode;
  onPress: React.MouseEventHandler<HTMLButtonElement>;
}): JSX.Element {
  return (
    <NextUIButton light auto color={color} onPress={onPress} icon={icon}>
      {children}
    </NextUIButton>
  );
}

export default Button;
