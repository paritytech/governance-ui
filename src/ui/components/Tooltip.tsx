import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content?: JSX.Element;
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'above' | 'below'>(
    'above'
  );
  const [tooltipAlignment, setTooltipAlignment] = useState<
    'left' | 'center' | 'right'
  >('center');

  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseOver = () => {
    setShowTooltip(true);
  };

  const handleMouseOut = () => {
    setShowTooltip(false);
  };

  useEffect(() => {
    if (showTooltip) {
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      const childRect =
        tooltipRef.current?.parentElement?.getBoundingClientRect();

      if (tooltipRect && childRect) {
        const distanceFromLeft =
          childRect.left + window.pageXOffset - tooltipRect.width / 2;

        if (distanceFromLeft < 0) {
          setTooltipAlignment('left');
        } else if (
          distanceFromLeft + tooltipRect.width + 10 >
          window.innerWidth
        ) {
          setTooltipAlignment('right');
        } else {
          setTooltipAlignment('center');
        }

        const distanceFromTop =
          childRect.top + window.pageYOffset - tooltipRect.height;

        if (distanceFromTop < 0) {
          setTooltipPosition('below');
        } else {
          setTooltipPosition('above');
        }
      }
    }
  }, [showTooltip]);

  return (
    <div
      className="relative overflow-visible"
      ref={tooltipRef}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {children}
      {showTooltip && (
        <div
          className={`absolute z-10 rounded bg-black px-4 py-2 text-white ${
            tooltipPosition === 'above' ? 'bottom-full' : 'top-full'
          } ${
            tooltipAlignment === 'left'
              ? 'left-0'
              : tooltipAlignment === 'right'
              ? 'right-0'
              : 'left-1/2 -translate-x-1/2 transform'
          } ${tooltipPosition === 'above' ? 'mb-2' : 'mt-2'}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
