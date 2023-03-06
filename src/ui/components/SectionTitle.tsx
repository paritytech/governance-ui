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
    <div className="items-top flex justify-between">
      <div className="prose prose-sm  pb-4">
        <h2 className="mb-2">{title}</h2>
        <div className="text-base">{children}</div>
      </div>
      <ProgressStepper step={step} />
    </div>
  );
}

SectionTitle.defaultProps = {
  title: 'Select Delegates',
  step: 0,
};
