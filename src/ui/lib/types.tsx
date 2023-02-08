export interface BaseElementProps {
  children?: React.ReactNode;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}

export interface ClickableProps extends BaseElementProps {
  onClick?: React.MouseEventHandler<HTMLElement> | undefined;
}
