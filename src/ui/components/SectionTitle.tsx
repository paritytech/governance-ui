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
      className={`items-top sticky top-0 z-50 flex h-auto flex-col-reverse justify-between gap-3 bg-bg-default px-3 py-6 lg:flex-row lg:gap-6 lg:px-8 ${className}`}
    >
      <div
        className={`flex flex-col ${
          center ? 'justify-center' : 'justify-start'
        }  gap-0`}
      >
        <span className="font-unbounded text-h4">{title}</span>
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
