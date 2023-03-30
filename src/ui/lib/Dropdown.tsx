import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../icons';

export type Option = {
  value: any;
  label: string;
  active?: boolean;
};

export const Dropdown = ({
  options,
  className,
  onSelect,
  menuAlign = 'left',
}: {
  options: Option[];
  className?: string;
  onSelect: (option: Option) => void;
  menuAlign?: 'right' | 'left' | 'center';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option>(
    options.filter((o) => o.active)[0]
  );

  const alignClass = {
    right: 'right-0',
    left: 'left-0',
    center: 'left-1/2 translate-x-[-50%]',
  };
  const handleOptionClick = (option: Option) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div>
      <div
        className={`flex min-w-min appearance-none items-center gap-2 rounded-full border border-solid py-2 px-4 hover:border-primary ${
          className || ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="grow">{selectedOption ? selectedOption.label : ''}</div>
        <div>{isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}</div>
      </div>
      <div className="relative mt-1 h-0">
        {isOpen && (
          <ul
            className={`absolute top-0 flex w-full min-w-max flex-col gap-4 rounded-lg border p-3 backdrop-blur-3xl duration-300 ${alignClass[menuAlign]}`}
          >
            {options.map((option, idx) => (
              <li key={idx} onClick={() => handleOptionClick(option)}>
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
