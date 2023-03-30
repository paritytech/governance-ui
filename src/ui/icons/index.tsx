interface IconProps {
  size?: string;
  className?: string;
}

export function ChevronDownIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      viewBox="0 0 29 29"
    >
      <path d="M25.988 8.563l-11.01 13-10.99-13" data-nofill="true"></path>
    </svg>
  );
}

export function ChevronUpIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      viewBox="0 0 29 29"
    >
      <path d="M3 21.1309L14.011 8.13086L25 21.1309" data-nofill="true"></path>
    </svg>
  );
}

export function ChevronRightIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 28"
    >
      <path d="M9 6l9 7.508L9 21" data-nofill="true"></path>
    </svg>
  );
}

export function AddIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 28"
    >
      <path d="M13.988 2c6.628 0 12 5.373 12 12s-5.372 12-12 12c-6.627 0-12-5.373-12-12s5.373-12 12-12zM8.794 13.46l10.39.057M14.018 8.295l-.057 10.39"></path>
    </svg>
  );
}

export function CloseIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 29 29"
    >
      <path
        d="M4.893 4.231l19.799 19.8M24.692 4.231l-19.8 19.8"
        data-nofill="true"
      ></path>
    </svg>
  );
}

export function DelegateIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 28"
    >
      <path
        strokeMiterlimit="10"
        d="M25.473 16l-10 10M12 2.62l-10 10M2.107 26L25.5 2.607"
        data-nofill="true"
      ></path>
      <path
        d="M20.448 15.399l5.534-.018.018 5.55M6.975 2.018L12.509 2l.018 5.55M20.448 2.018L25.982 2 26 7.55"
        data-nofill="true"
      ></path>
    </svg>
  );
}

export function MoreHorizontalIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 28"
    >
      <circle
        cx="4.33"
        cy="14.33"
        r="2.355"
        transform="rotate(45 4.33 14.33)"
      ></circle>
      <circle
        cx="14"
        cy="14.33"
        r="2.355"
        transform="rotate(45 14 14.33)"
      ></circle>
      <circle
        cx="23.67"
        cy="14.33"
        r="2.355"
        transform="rotate(45 23.67 14.33)"
      ></circle>
    </svg>
  );
}

export function CheckIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 28"
    >
      <path d="M3 13.946L10.766 21 25 7" data-nofill="true"></path>
    </svg>
  );
}
export function WalletIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 28"
    >
      <path d="M26.76 3.25H1.24v21.5h25.52V3.25z"></path>
      <path d="M26.774 8.98H17.77a5.02 5.02 0 000 10.04h9.005V8.98z"></path>
      <circle cx="18" cy="14" r="1"></circle>
    </svg>
  );
}

export function DisconnectIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 28"
    >
      <path
        d="M11.45 9H6.73A4.73 4.73 0 002 13.73v0a4.73 4.73 0 004.73 4.73h4.72M16.497 18.497h4.773a4.73 4.73 0 004.73-4.73v0a4.73 4.73 0 00-4.73-4.73h-4.773M20.108 13.736H7.862M3 2l22 24"
        data-nofill="true"
      ></path>
    </svg>
  );
}

export function ConnectedIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 29 29"
    >
      <path
        d="M17.468 18.628h4.773a4.73 4.73 0 004.73-4.73v0a4.73 4.73 0 00-4.73-4.73h-4.773M12.42 9.13H7.7a4.73 4.73 0 00-4.73 4.73v0a4.73 4.73 0 004.73 4.73h4.72M21.079 13.867H8.833"
        data-nofill="true"
      ></path>
    </svg>
  );
}

export function PolkadotCircleIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      viewBox="0 0 23 23"
    >
      <path
        fill="#E6007A"
        d="M11.064 5.3c2.106 0 3.813-.996 3.813-2.225 0-1.23-1.707-2.226-3.813-2.226S7.25 1.846 7.25 3.075 8.958 5.3 11.064 5.3zM11.064 22.064c2.106 0 3.813-.996 3.813-2.225 0-1.23-1.707-2.226-3.813-2.226s-3.813.997-3.813 2.226 1.707 2.225 3.813 2.225zM5.75 8.378c1.052-1.83 1.046-3.81-.015-4.425-1.062-.615-2.775.37-3.828 2.2s-1.047 3.81.015 4.425c1.06.615 2.775-.37 3.827-2.2zM20.221 16.76c1.053-1.829 1.047-3.81-.015-4.425-1.06-.615-2.774.37-3.827 2.2s-1.047 3.81.015 4.425c1.06.615 2.775-.37 3.827-2.2zM5.735 18.96c1.06-.614 1.067-2.596.014-4.425-1.052-1.83-2.766-2.814-3.827-2.2-1.062.615-1.068 2.596-.015 4.426 1.053 1.83 2.766 2.814 3.828 2.2zM20.206 10.578c1.062-.615 1.068-2.596.015-4.425-1.052-1.83-2.766-2.815-3.827-2.2-1.062.614-1.068 2.596-.015 4.425 1.053 1.83 2.766 2.815 3.827 2.2z"
      ></path>
    </svg>
  );
}

export function MessageIcon({ size, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size ? size : '16'}
      height={size ? size : '16'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 28"
    >
      <path d="M7.02 19.893v5.589l7.337-5.59h12.395V2.25h-25.5v17.644H7.02z"></path>
      <circle cx="7.5" cy="11.5" r="1.5"></circle>
      <circle cx="13.5" cy="11.5" r="1.5"></circle>
      <circle cx="19.5" cy="11.5" r="1.5"></circle>
    </svg>
  );
}
