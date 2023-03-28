export interface BaseElementProps {
  children?: React.ReactNode;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  disabled?: boolean;
}

export interface ClickableProps extends BaseElementProps {
  onClick?: React.MouseEventHandler<HTMLElement> | undefined;
}
