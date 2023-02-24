import { createContext, useState, useContext } from 'react';

interface IDelegationContext {
  selectedTracks: Set<number>;
  setTrackSelection: (id: number, selection: boolean) => void;
}
const delegationContextDefault = {
  selectedTracks: new Set([]),
  setTrackSelection: () => {
    console.error(
      'DelegationContext is used outside of its provider boundary.'
    );
  },
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
  const setTrackSelection = (id: number, selection: boolean) => {
    _setSelectedTracks((oldSelection) => {
      const newSelection = new Set(oldSelection);
      selection ? newSelection.add(id) : newSelection.delete(id);
      return newSelection;
    });
  };
  return (
    <DelegationContext.Provider value={{ selectedTracks, setTrackSelection }}>
      {children}
    </DelegationContext.Provider>
  );
}
