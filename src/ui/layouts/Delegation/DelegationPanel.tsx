import { TrackSelect } from '../../components/delegation/TrackSelect.js';
import { useDelegation } from '../../../contexts/Delegation.js';
import { ConnectedState, State } from '../../../lifecycle/types.js';
import {
  useAppLifeCycle,
  filterOngoingReferenda,
  extractDelegatedTracks,
} from '../../../lifecycle/index.js';
import { ReferendumOngoing } from '../../../types.js';
import Headline from '../../components/Headline.js';
import { DelegatesBar } from '../../components/DelegatesBar.js';
import { ActiveDelegates } from '../../components/ActiveDelegates.js';
import { DelegateSection } from '../../components/delegation/DelegateSection.js';

function exportReferenda(state: State): Map<number, ReferendumOngoing> {
  if (state.type === 'ConnectedState') {
    return filterOngoingReferenda(state.chain.referenda);
  }
  return new Map();
}

export function DelegationPanel() {
  const { state } = useAppLifeCycle();
  const { delegates } = state;

  // A map of delegates with asociated tracks. Empty if no tracks are currently delegated.
  const delegatesWithTracks = extractDelegatedTracks(state);

  const network = (state as ConnectedState).network;

  const { selectedTrackIndexes, sectionRefs, scrollToSection } =
    useDelegation();

  // If user has some active delegation,
  return (
    <>
      {delegatesWithTracks.size ? (
        <ActiveDelegates
          delegatesWithTracks={delegatesWithTracks}
          state={state}
        />
      ) : (
        <>
          <Headline />
          <DelegatesBar delegates={delegates} state={state} />
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
    </>
  );
}
