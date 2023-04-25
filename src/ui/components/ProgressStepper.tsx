import { CheckIcon, MoreHorizontalIcon } from '../icons';

interface ProgressStepperProps {
  step: number;
  steps: [string];
}

export default function ProgressStepper({ step, steps }: ProgressStepperProps) {
  let lefIcon = <MoreHorizontalIcon />;
  if (step > 0) lefIcon = <CheckIcon />;

  let middleIcon = (
    <div className="bg-foreground-contrast bg-fill h-1 w-1 rounded-full" />
  );
  if (step === 1) middleIcon = <MoreHorizontalIcon />;
  if (step === 2) middleIcon = <CheckIcon />;

  let rightIcon = (
    <div className="bg-foreground-contrast h-1 w-1 rounded-full" />
  );
  if (step === 2) rightIcon = <MoreHorizontalIcon />;

  return (
    <div className="flex w-full flex-col gap-2 font-medium lg:w-1/2">
      <div className="bg-background-dip flex h-[24px] rounded-full p-[1px]">
        <div
          className={`flex items-center justify-center px-2 ${
            step < 1 ? 'rounded-full' : ' rounded-l-full'
          } bg-background-float text-foreground-primary`}
        >
          {lefIcon}
        </div>
        <div className={`grow ${step < 1 ? `` : `bg-background-float`}`} />
        <div
          className={`flex items-center justify-center px-2 ${
            step < 1
              ? `w-[24px] rounded-full bg-none`
              : step < 2
              ? 'bg-background-float rounded-r-full '
              : 'bg-background-float rounded-none'
          } text-foreground-primary`}
        >
          {middleIcon}
        </div>
        <div className={`grow ${step < 2 ? `` : `bg-background-float`}`} />
        <div
          className={`flex items-center justify-center px-2 ${
            step < 2
              ? 'bg-trans w-[24px] rounded-full bg-none'
              : 'bg-background-float rounded-r-full'
          } text-foreground-primary`}
        >
          {rightIcon}
        </div>
      </div>
      <div className="text-body2 flex justify-between whitespace-nowrap">
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
                index === step
                  ? 'text-foreground-primary font-semibold'
                  : 'text-foreground-contrast font-medium'
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
  steps: ['Tracks', 'Delegate', 'Sign'],
};
