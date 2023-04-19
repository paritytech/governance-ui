import { TrackSelect } from '../components/delegation/TrackSelect.js';
import { useDelegation } from '../../contexts/Delegation';
import { ConnectedState, State } from '../../lifecycle/types.js';
import {
  useAppLifeCycle,
  filterOngoingReferenda,
  extractDelegatedTracks,
} from '../../lifecycle';
import { ReferendumOngoing } from '../../types';
import Headline from '../components/Headline';
import { DelegatesBar } from '../components/DelegatesBar';
import { ActiveDelegates } from '../components/ActiveDelegates';
import { DelegateSection } from '../components/delegation/DelegateSection.js';

function exportReferenda(state: State): Map<number, ReferendumOngoing> {
  if (state.type === 'ConnectedState') {
    return filterOngoingReferenda(state.chain.referenda);
  }
  return new Map();
}

export function DelegationPanel({
  selectedDelegate,
}: {
  selectedDelegate?: string;
}) {
  const { state } = useAppLifeCycle();
  const { delegates } = state;

  // A map of delegates with asociated tracks. Empty if no tracks are currently delegated.
  const delegatesWithTracks = extractDelegatedTracks(state);

  const network = (state as ConnectedState).network;

  const { selectedTrackIndexes, sectionRefs, scrollToSection } =
    useDelegation();

  // If user has some active delegation,
  return (
    <main
      className="flex w-full flex-auto flex-col items-center justify-start gap-8 pt-14 md:pt-20 lg:gap-16"
      ref={sectionRefs.get('top')}
    >
      {delegatesWithTracks.size ? (
        <ActiveDelegates
          delegatesWithTracks={delegatesWithTracks}
          state={state}
        />
      ) : (
        <>
          <Headline />
          <DelegatesBar
            delegates={delegates}
            selectedDelegate={selectedDelegate}
            state={state}
          />
        </>
      )}
      <TrackSelect
        network={network}
        details={state.details}
        referenda={exportReferenda(state)}
        tracks={state.tracks}
        delegateHandler={() => scrollToSection('delegation')}
      />
      {selectedTrackIndexes.size > 0 && (
        <div ref={sectionRefs.get('delegation')}>
          <DelegateSection state={state} delegates={delegates} />
        </div>
      )}
    </main>
  );
}
