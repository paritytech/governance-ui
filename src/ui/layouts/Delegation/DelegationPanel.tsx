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
import { useState } from 'react';

export function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 29 29"
    >
      <path
        d="M4.893 4.231l19.799 19.8M24.692 4.231l-19.8 19.8"
        data-nofill="true"
      ></path>
    </svg>
  );
}

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

  const currentlyVisible = localStorage.getItem('headlineVisible');

  const [headlineVisible, setHeadlineVisible] = useState(currentlyVisible);

  // If user has some active delegation,
  return (
    <>
      {delegatesWithTracks.size ? (
        <ActiveDelegates
          delegatesWithTracks={delegatesWithTracks}
          state={state}
        />
      ) : (
        <div className="flex w-full flex-col gap-12">
          <div
            className={`flex w-full justify-between px-6 ${
              headlineVisible === 'false' || null ? 'block' : 'hidden'
            }`}
          >
            <div className="w-10" />
            <Headline />
            <div
              className="mt-6 flex h-fit w-fit cursor-pointer items-center justify-center rounded-full bg-white p-3"
              onClick={() => {
                setHeadlineVisible('true');
                window.localStorage.setItem('headlineVisible', 'true');
              }}
            >
              <CloseIcon />
            </div>
          </div>
          <DelegatesBar delegates={delegates} state={state} />
        </div>
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
