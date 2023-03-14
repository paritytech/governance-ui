interface SectionTitleProps {
  title: string;
  description?: string;
  children?: JSX.Element;
}

export default function SectionTitle({
  title,
  description,
  children,
}: SectionTitleProps) {
  return (
    <div className="items-top flex h-auto w-full flex-col justify-between gap-6 lg:flex-row">
      <div className=" prose prose-sm  pt-1">
        <h2 className="mb-2">{title}</h2>
        <div className="text-sm">{description}</div>
      </div>
      {children}
    </div>
  );
}

SectionTitle.defaultProps = {
  title: 'Select Delegates',
  step: 0,
};
