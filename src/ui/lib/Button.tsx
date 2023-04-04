import type { ClickableProps } from './types.js';

const styles = [
  {
    name: 'primary',
    style: `flex min-w-min appearance-none items-center  justify-center  gap-2 rounded-full bg-fill-primary hover:bg-fill-primary-hover active:bg-fill-primary-pressed px-4 py-2 text-sm  text-white disabled:opacity-50 `,
  },
  {
    name: 'secondary',
    style: `flex min-w-min appearance-none items-center justify-center  gap-2 rounded-full bg-fill-secondary hover:bg-fill-secondary-hover active:bg-fill-secondary-pres px-4 py-2 text-sm text-white  disabled:bg-gray-200 disabled:text-fg-disabled`,
  },
  {
    name: 'outline',
    style: `flex min-w-min appearance-none items-center justify-center gap-2 rounded-full border border-solid px-4 py-2 hover:border-primary`,
  },
];

export function Button({
  children,
  style,
  onClick,
  variant,
  className,
  ...rest
}: ClickableProps): JSX.Element {
  const current = variant
    ? styles.find(({ name }) => name === variant)
    : styles.find(({ name }) => name === 'secondary');
  return (
    <button
      className={`${current?.style} ${className}`}
      style={{ ...style }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
