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
  bordered,
  onPress,
}: {
  children: React.ReactNode;
  color: keyof typeof Colors;
  icon?: React.ReactNode;
  bordered?: boolean;
  onPress: React.MouseEventHandler<HTMLButtonElement>;
}): JSX.Element {
  return (
    <NextUIButton
      light
      auto
      color={color}
      onPress={onPress}
      icon={icon}
      bordered={bordered}
    >
      {children}
    </NextUIButton>
  );
}

export default Button;
