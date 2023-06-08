import { CheckIcon } from '../icons';
import Tooltip from './Tooltip';

export function CheckBox({
  title,
  checked,
  onChange,
  background,
  disabled,
  tooltipContent,
  tooltipTitle,
}: {
  title?: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  background?: boolean;
  disabled?: boolean;
  tooltipContent?: JSX.Element;
  tooltipTitle?: string;
}) {
  const checkboxId = `${title}-checkbox`;
  const getCheckboxStyle = (checked: boolean, disabled: boolean) => {
    let classNames = 'flex h-4 w-4 rounded-sm border-[1px] p-[1px]';
    if (disabled) {
      classNames = `${classNames} border-gray-300 text-fg-disabled ${
        checked ? 'bg-gray-300' : 'bg-white'
      } `;
    } else {
      classNames = `${classNames} ${
        checked
          ? 'border-primary bg-primary hover:brightness-95'
          : 'border-gray-500  bg-white hover:brightness-95'
      }`;
    }
    return classNames;
  };

  return (
    <div
      className={`rounded-sd flex h-fit w-fit items-center gap-3 ${
        background
          ? `border border-gray-300 bg-gray-200   px-2 py-2 lg:px-4`
          : ''
      } `}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />

      <label
        htmlFor={checkboxId}
        className="flex w-full cursor-pointer items-center justify-between gap-2"
      >
        <div className={getCheckboxStyle(!!checked, !!disabled)}>
          <CheckIcon
            className={`h-full w-full ${
              checked ? 'block' : 'hidden'
            } text-white`}
          />
        </div>
        <span
          className={`select-none whitespace-nowrap text-body-2 font-semibold ${
            disabled ? 'text-fg-disabled' : 'text-gray-900'
          }`}
        >
          {title}
        </span>
      </label>
      {tooltipTitle && (
        <Tooltip content={tooltipContent} title={tooltipTitle} />
      )}
    </div>
  );
}
