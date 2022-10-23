import React, { createContext, useContext, useReducer, FunctionComponent, useMemo } from 'react';
import { StoreAction, AppState } from '../types/store';

export const StateContext = createContext<any>(null);
export const DispatchContext = createContext<any>(null);

interface Props {
  reducer: (arg1: any, arg2: StoreAction) => AppState;
  initialState: AppState;
}

export const StateProvider: FunctionComponent<Props> = ({ reducer, initialState, children }) => {
  const [appState, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => {
    return { appState, dispatch };
  }, [appState]);
  return (
    <StateContext.Provider value={value.appState}>
      <DispatchContext.Provider value={value.dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export const useStoreState = () => useContext(StateContext);
export const useStoreDispatch = () => useContext(DispatchContext);
