import { useMemo } from 'react';
import { Delegate, State } from '../../lifecycle/types.js';
import { DelegateCard } from './delegation/DelegateCard.js';

function filterVisibleDelegates(delegates: Delegate[]): Delegate[] {
  const shuffledDelegates = new Array(...delegates).sort(
    () => 0.5 - Math.random()
  );
  return shuffledDelegates.slice(0, 5);
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
        <span className="font-unbounded text-h4">Choose a Worthy Delegate</span>
      </div>
      <div className="flex max-w-full gap-7 overflow-x-auto px-3 pb-1 lg:px-6	">
        {visibleDelegates.map((delegate, idx) => (
          <DelegateCard
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
