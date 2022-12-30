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
  label,
  bordered,
  onPress,
}: {
  children?: React.ReactNode;
  color?: keyof typeof Colors;
  icon?: React.ReactNode;
  label: string;
  bordered?: boolean;
  onPress: (e: PressEvent) => void;
}): JSX.Element {
  return (
    <NextUIButton
      light
      auto
      color={color}
      onPress={onPress}
      icon={icon}
      bordered={bordered}
      ariaLabel={label}
    >
      {children}
    </NextUIButton>
  );
}

export default Button;
