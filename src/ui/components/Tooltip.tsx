import { useState } from 'react';
import { Modal } from '../lib';
import { InformationalIcon } from '../icons';

interface TooltipProps {
  title?: string;
  content?: JSX.Element;
  children?: React.ReactNode;
}
export default function Tooltip({ content, title }: TooltipProps) {
  const [infoVisible, setInfoVisible] = useState(false);

  return (
    <div
      className="flex cursor-pointer items-center gap-2"
      onClick={() =>
        infoVisible ? setInfoVisible(false) : setInfoVisible(true)
      }
    >
      <InformationalIcon />
      {infoVisible && (
        <Modal
          size="lg"
          open={infoVisible}
          onClose={() => setInfoVisible(false)}
        >
          <div className="flex max-h-[90vh] w-full flex-col gap-4 p-4">
            <h2 className="font-unbounded text-h5 capitalize">{title}</h2>
            {content}
          </div>
        </Modal>
      )}
    </div>
  );
}
