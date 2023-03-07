import { CheckIcon, MoreHorizontalIcon } from '../icons';

interface ProgressStepperProps {
  step: number;
  steps: [string];
}

export default function ProgressStepper({ step, steps }: ProgressStepperProps) {
  let lefIcon = <MoreHorizontalIcon />;
  if (step > 0) lefIcon = <CheckIcon />;

  let middleIcon = null;
  if (step === 1) middleIcon = <MoreHorizontalIcon />;
  if (step === 2) middleIcon = <CheckIcon />;

  let rightIcon = null;
  if (step === 2) rightIcon = <MoreHorizontalIcon />;

  return (
    <div className="flex w-1/2 flex-col gap-2">
      <div className="flex h-[32px] rounded-full bg-gray-200 p-1">
        <div
          className={`flex items-center justify-center px-2 ${
            step < 1 ? 'rounded-full' : ' rounded-l-full'
          } bg-primary text-white`}
        >
          {lefIcon}
        </div>
        <div className={`grow ${step < 1 ? `` : `bg-primary`}`} />
        <div
          className={`flex items-center justify-center px-2 ${
            step < 1
              ? `w-[24px] rounded-full bg-white `
              : step < 2
              ? 'rounded-r-full bg-primary'
              : 'rounded-none bg-primary'
          } text-white`}
        >
          {middleIcon}
        </div>
        <div className={`grow ${step < 2 ? `` : `bg-primary`}`} />
        <div
          className={`flex items-center justify-center px-2 ${
            step < 2
              ? 'w-[24px] rounded-full bg-white '
              : 'rounded-r-full bg-primary'
          } text-white`}
        >
          {rightIcon}
        </div>
      </div>
      <div className="flex justify-between whitespace-nowrap text-sm">
        {steps.map((currentStep, index) => {
          return (
            <span
              key={index}
              className={`w-full ${
                index === 0
                  ? 'text-left'
                  : index === 1
                  ? 'text-center'
                  : 'text-right'
              } ${
                index === step ? 'font-semibold text-primary' : 'text-black'
              }`}
            >
              {currentStep}
            </span>
          );
        })}
      </div>
    </div>
  );
}

ProgressStepper.defaultProps = {
  step: 0,
  steps: ['Select Track', 'Select Delegate', 'Sign Transaction'],
};
