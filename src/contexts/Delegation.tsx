import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useLifeCycle } from '../lifecycle';
import { TrackDelegation } from '../types';
import { useAccount } from './Account';
import { tracksMetadata } from '../chain/mocks';

interface IDelegationContext {
  selectedTracks: Set<number>;
  setTrackSelection: (id: number, selection: boolean) => void;
  currentDelegations: TrackDelegation[];
}
const delegationContextDefault = {
  selectedTracks: new Set([]),
  setTrackSelection: () => {
    console.error(
      'DelegationContext is used outside of its provider boundary.'
    );
  },
  currentDelegations: [],
};
const DelegationContext = createContext<IDelegationContext>(
  delegationContextDefault
);

export const useDelegation = () => useContext(DelegationContext);

export function DelegationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedTracks, _setSelectedTracks] = useState<Set<number>>(new Set());
  const [delegations, setDelegations] = useState<TrackDelegation[]>([]);
  const [delegationUnsub, setDelegationUnsub] = useState<() => void>();
  const delegationUnsubRef = useRef(delegationUnsub);

  const setTrackSelection = (id: number, selection: boolean) => {
    _setSelectedTracks((oldSelection) => {
      const newSelection = new Set(oldSelection);
      selection ? newSelection.add(id) : newSelection.delete(id);
      return newSelection;
    });
  };

  // subscribe
  const { connectedAccount } = useAccount();
  const [_, updater] = useLifeCycle();
  const connectedAddress = connectedAccount?.account?.address;
  useEffect(() => {
    const trackIds = tracksMetadata
      .map((track) => track.subtracks)
      .flat()
      .map((t) => t.id);
    if (connectedAddress) {
      updater
        .subscribeToDelegates(connectedAddress, trackIds, (delegations) => {
          setDelegations(delegations);
        })
        .then((unsub) => setDelegationUnsub(unsub));
    }
    return () => {
      console.log('unsub');
      const unsub = delegationUnsubRef.current;
      unsub && unsub();
    };
  }, [connectedAddress]);

  return (
    <DelegationContext.Provider
      value={{
        selectedTracks,
        setTrackSelection,
        currentDelegations: delegations,
      }}
    >
      {children}
    </DelegationContext.Provider>
  );
}
