import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDown,
  faAngleRight,
  faAnglesRight,
  faPlus,
  faShareFromSquare,
  faWallet,
  faRightFromBracket,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';

export function CaretDownIcon() {
  return <FontAwesomeIcon icon={faAngleDown} fixedWidth />;
}

export function CaretRightIcon() {
  return <FontAwesomeIcon icon={faAngleRight} fixedWidth />;
}

export function PlusIcon() {
  return <FontAwesomeIcon icon={faPlus} fixedWidth />;
}

export function DelegateIcon() {
  return <FontAwesomeIcon icon={faShareFromSquare} fixedWidth />;
}

export function WalletIcon() {
  return <FontAwesomeIcon icon={faWallet} fixedWidth />;
}

export function DisconnectIcon() {
  return <FontAwesomeIcon icon={faRightFromBracket} fixedWidth />;
}

export function NextIcon() {
  return <FontAwesomeIcon icon={faAnglesRight} fixedWidth />;
}

export function CircleIcon({ size }: { size?: SizeProp }) {
  return <FontAwesomeIcon icon={faCircle} fixedWidth size={size} />;
}
