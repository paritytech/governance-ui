import React from "react";
import { Button as NextUIButton } from "@nextui-org/react";

enum Colors {
  default,
  primary,
  secondary,
  success,
  warning,
  error,
}

function Button({ color, icon, onPress }: { color: keyof typeof Colors, icon: React.ReactNode, onPress: React.MouseEventHandler<HTMLButtonElement> }): JSX.Element {
  return (
    <NextUIButton
      light
      auto
      color={color}
      onPress={onPress}
      icon={icon} />);
}

export default Button;