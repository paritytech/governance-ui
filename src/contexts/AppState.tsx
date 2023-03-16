import React, { useContext, createContext } from 'react';
import { Updater, State, useLifeCycle } from '../lifecycle';

interface IAppStateContext {
  state: State;
  updater: Updater;
}

const appStateContext = createContext<IAppStateContext>({} as IAppStateContext);

export const useAppState = () => useContext(appStateContext);

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, updater] = useLifeCycle();
  return (
    <appStateContext.Provider value={{ state, updater }}>
      {children}
    </appStateContext.Provider>
  );
};

export default AppStateProvider;
