import { createContext, useState, useContext } from 'react';

interface IDelegationContext {
  selectedTrackIndexes: Set<number>;
  setTrackSelection: (id: number, selection: boolean) => void;
  clearTrackSelection: () => void;
}
const delegationContextDefault = {
  selectedTrackIndexes: new Set([]),
  setTrackSelection: () => {
    console.error(
      'DelegationContext is used outside of its provider boundary.'
    );
  },
  clearTrackSelection: () => {
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
  const [selectedTrackIndexes, _setSelectedTrackIndexes] = useState<
    Set<number>
  >(new Set());
  const setTrackSelection = (id: number, selection: boolean) => {
    _setSelectedTrackIndexes((oldSelection) => {
      const newSelection = new Set(oldSelection);
      selection ? newSelection.add(id) : newSelection.delete(id);
      return newSelection;
    });
  };
  const clearTrackSelection = () => {
    _setSelectedTrackIndexes(new Set([]));
  };
  return (
    <DelegationContext.Provider
      value={{ selectedTrackIndexes, setTrackSelection, clearTrackSelection }}
    >
      {children}
    </DelegationContext.Provider>
  );
}
