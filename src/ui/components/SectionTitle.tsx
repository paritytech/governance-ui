import ProgressStepper from './ProgressStepper';

interface SectionTitleProps {
  title: string;
  children?: string;
  step?: number;
}

export default function SectionTitle({
  title,
  children,
  step,
}: SectionTitleProps) {
  return (
    <div className="items-top flex h-auto justify-between">
      <div className="prose prose-sm  pt-1">
        <h2 className="mb-2">{title}</h2>
        <div className="text-sm">{children}</div>
      </div>
      <ProgressStepper step={step} />
    </div>
  );
}

SectionTitle.defaultProps = {
  title: 'Select Delegates',
  step: 0,
};
