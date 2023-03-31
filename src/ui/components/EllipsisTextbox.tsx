import React, { useRef, useState, useEffect } from 'react';
import { Remark } from 'react-remark';

const EllipsisTextbox = ({
  text,
  expandLinkTitle,
  onExpand,
  className,
}: {
  text: string;
  expandLinkTitle: string;
  onExpand: () => void;
  className: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  const scrollHeight = containerRef.current?.scrollHeight;
  const clientHeight = containerRef.current?.clientHeight;
  useEffect(() => {
    if (scrollHeight !== undefined && clientHeight !== undefined) {
      setIsOverflowed(scrollHeight > clientHeight);
    }
  }, [scrollHeight, clientHeight]);
  return (
    <div className="flex flex-col">
      <div
        className={`relative overflow-hidden text-ellipsis text-base ${className}`}
        ref={containerRef}
      >
        <Remark>{text}</Remark>
      </div>

      <div className="mt-2 w-full text-right text-primary">
        {isOverflowed && (
          <span className="cursor-pointer" onClick={() => onExpand()}>
            {expandLinkTitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default EllipsisTextbox;
