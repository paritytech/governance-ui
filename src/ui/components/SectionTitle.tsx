interface SectionTitleProps {
  title: string;
  description?: JSX.Element;
  children?: JSX.Element;
}

export default function SectionTitle({
  title,
  description,
  children,
}: SectionTitleProps) {
  return (
    <div className="items-top flex h-auto flex-col-reverse justify-between gap-3 lg:flex-row lg:gap-6">
      <div className="prose prose-sm  pt-1">
        <h2 className="mb-2">{title}</h2>
        {description}
      </div>
      {children}
    </div>
  );
}

SectionTitle.defaultProps = {
  title: 'Select Delegates',
  step: 0,
};
