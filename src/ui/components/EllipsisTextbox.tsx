import React, { useRef, useState, useEffect } from 'react';
import { Remark } from 'react-remark';
import { Link } from 'wouter';

const EllipsisTextbox = ({
  text,
  expandLinkTitle,
  className,
  address,
}: {
  text: string;
  expandLinkTitle: string;
  className: string;
  address: string;
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
    <Link href={`/${address}`}>
      <div tabIndex={-1} className="flex flex-col">
        <div
          className={`overflow-hidden text-ellipsis text-body-2 md:text-body ${
            isOverflowed ? 'cursor-pointer' : ''
          } ${className}`}
          ref={containerRef}
        >
          <Remark>{text}</Remark>
        </div>

        {isOverflowed && (
          <div className="mt-2 w-full text-primary">
            <span className="cursor-pointer">{expandLinkTitle}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default EllipsisTextbox;
