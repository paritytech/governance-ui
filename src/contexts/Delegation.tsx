import {
  createContext,
  useState,
  useContext,
  useCallback,
  useRef,
} from 'react';

type PageSection = 'top' | 'delegation';

export const gotoSection = (section: React.MutableRefObject<any>) => {
  section?.current?.scrollIntoView({ behavior: 'smooth' });
};

interface IDelegationContext {
  selectedTrackIndexes: Set<number>;
  sectionRefs: Map<PageSection, React.MutableRefObject<any>>;
  setTrackSelection: (id: number, selection: boolean) => void;
  clearTrackSelection: () => void;
  scrollToSection: (section: PageSection) => void;
}
const delegationContextDefault = {
  selectedTrackIndexes: new Set([]),
  sectionRefs: new Map<PageSection, React.MutableRefObject<any>>(),
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
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  scrollToSection: (section: PageSection) => {
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

  // refrences to sections of the app that needs to be acessible to scroll to.
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [sectionRefs, _] = useState<
    Map<PageSection, React.MutableRefObject<any>>
  >(
    new Map([
      ['top', useRef()],
      ['delegation', useRef()],
    ])
  );

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

  const scrollToSection = useCallback(
    (section: PageSection) => {
      const sectionRef = sectionRefs.get(section);
      if (sectionRef?.current) {
        gotoSection(sectionRef);
      } else {
        console.error(`No ${section} section was found to scroll to.`);
      }
    },
    [sectionRefs]
  );

  return (
    <DelegationContext.Provider
      value={{
        selectedTrackIndexes,
        setTrackSelection,
        clearTrackSelection,
        sectionRefs,
        scrollToSection,
      }}
    >
      {children}
    </DelegationContext.Provider>
  );
}
