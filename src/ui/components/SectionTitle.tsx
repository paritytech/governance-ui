interface SectionTitleProps {
  title: string;
  description?: JSX.Element;
  children?: JSX.Element;
  center?: boolean;
  className?: string;
}

export default function SectionTitle({
  title,
  description,
  children,
  center,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={`bg-background-default sticky top-20 flex h-auto flex-col-reverse items-center justify-between gap-3 px-3 py-6 lg:flex-row lg:gap-6 lg:px-8 ${className}`}
    >
      <div
        className={`flex flex-col gap-2 ${
          center ? 'justify-center' : 'justify-start'
        }  gap-0`}
      >
        <span className="font-unbounded text-h5">{title}</span>
        <span className="text-body-2">{description}</span>
      </div>
      {children}
    </div>
  );
}

SectionTitle.defaultProps = {
  title: 'Select Delegates',
  step: 0,
};
