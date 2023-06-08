import { CheckIcon } from '../icons';

interface ProgressStepperProps {
  step: number;
  steps: [string];
}

export default function ProgressStepper({ step, steps }: ProgressStepperProps) {
  let lefIcon = <div className="h-1 w-1 rounded-full bg-primary" />;
  if (step > 0) lefIcon = <CheckIcon />;

  let middleIcon = <div className="h-1 w-1 rounded-full bg-gray-400" />;
  if (step === 1)
    middleIcon = <div className="h-1 w-1 rounded-full bg-primary" />;
  if (step === 2) middleIcon = <CheckIcon />;

  let rightIcon = <div className="h-1 w-1 rounded-full bg-gray-400" />;
  if (step === 2)
    rightIcon = <div className="h-1 w-1 rounded-full bg-primary" />;

  return (
    <div className="flex w-full flex-col gap-2 font-medium lg:w-1/2">
      <div className="flex h-[24px] rounded-full bg-gray-200 p-[1px]">
        <div
          className={`flex items-center justify-center px-2 ${
            step < 1 ? 'rounded-full' : ' rounded-l-full'
          } bg-white text-primary`}
        >
          {lefIcon}
        </div>
        <div className={`grow ${step < 1 ? `` : `bg-white`}`} />
        <div
          className={`flex items-center justify-center px-2 ${
            step < 1
              ? `w-[24px] rounded-full bg-none`
              : step < 2
              ? 'rounded-r-full bg-white '
              : 'rounded-none bg-white'
          } text-primary`}
        >
          {middleIcon}
        </div>
        <div className={`grow ${step < 2 ? `` : `bg-white`}`} />
        <div
          className={`flex items-center justify-center px-2 ${
            step < 2
              ? 'bg-trans w-[24px] rounded-full bg-none'
              : 'rounded-r-full bg-white'
          } text-primary`}
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
              } ${index === step ? ' text-primary' : 'text-black'}`}
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
