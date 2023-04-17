import SectionTitle from './SectionTitle';
import { DelegateCard } from './delegation/DelegateCard';
import { Delegate, State, TrackMetaData } from '../../lifecycle/types.js';

export const ActiveDelegates = ({
  state,
  delegatesWithTracks,
}: {
  state: State;
  delegatesWithTracks: Map<Delegate, TrackMetaData[]>;
}) => {
  return (
    <>
      <div className="flex w-full snap-start flex-col gap-2">
        <SectionTitle title="Active Delegates" />
        <div className="px-3 lg:px-8">
          <div className="grid grid-cols-1 place-items-center  gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {Array.from(delegatesWithTracks.entries()).map(
              ([delegate, delegatedTracks], idx) => (
                <DelegateCard
                  key={idx}
                  delegate={delegate}
                  delegatedTracks={delegatedTracks}
                  state={state}
                  variant="none"
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};
