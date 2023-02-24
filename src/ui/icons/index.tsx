import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDown,
  faAngleRight,
  faPlus,
  faShareFromSquare,
} from '@fortawesome/free-solid-svg-icons';

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
