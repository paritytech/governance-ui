interface SectionTitleProps {
  title: string;
  description?: JSX.Element | string;
  children?: JSX.Element;
  center?: boolean;
}

export default function SectionTitle({
  title,
  description,
  children,
  center,
}: SectionTitleProps) {
  return (
    <div className="items-top flex h-auto flex-col-reverse justify-between gap-3 lg:flex-row lg:gap-6">
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
