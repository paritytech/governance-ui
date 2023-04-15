import { useMemo } from 'react';
import { Delegate, State } from '../../lifecycle/types.js';
import { DelegateCard } from './delegation/DelegateCard.js';

function filterVisibleDelegates(delegates: Delegate[]): Delegate[] {
  return new Array(...delegates).sort(() => 0.5 - Math.random());
}
export function DelegatesBar({
  state,
  delegates,
}: {
  state: State;
  delegates: Delegate[];
}) {
  const visibleDelegates = useMemo(
    () => filterVisibleDelegates(delegates),
    [delegates]
  );
  return (
    <section className="flex w-full flex-col items-center justify-center gap-6 bg-gray-200 py-8 md:gap-12">
      <div className={`flex flex-col justify-center gap-0`}>
        <span className="px-3 font-unbounded text-h4">Volunteer Delegates</span>
      </div>
      <div className="flex max-w-full snap-x scroll-pl-6 gap-7 overflow-x-auto px-3 pb-1 lg:px-6	">
        {visibleDelegates.map((delegate, idx) => (
          <DelegateCard
            className="snap-start"
            key={idx}
            delegate={delegate}
            state={state}
            variant="all"
          />
        ))}
      </div>
    </section>
  );
}
