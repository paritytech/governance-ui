import React from 'react';
import { Button as NextUIButton } from '@nextui-org/react';

export enum Colors {
  default,
  primary,
  secondary,
  success,
  warning,
  error,
}

export function Button({
  children,
  color,
  icon,
  label,
  bordered,
  rounded,
  onPress,
}: {
  children?: React.ReactNode;
  color?: keyof typeof Colors;
  icon?: React.ReactNode;
  label?: string;
  bordered?: boolean;
  rounded?: boolean;
  onPress: () => void;
}): JSX.Element {
  return (
    <NextUIButton
      light
      auto
      color={color}
      onPress={onPress}
      icon={icon}
      bordered={bordered}
      rounded={rounded}
      aria-label={label}
    >
      {children}
    </NextUIButton>
  );
}
