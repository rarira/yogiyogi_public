import { Reducer, useReducer } from 'react';

export enum CarouselTimeOption {
  ALL = 'all',
  NEW = 'new',
  SOON = 'soon',
}
export interface MySubsState {
  confirmVisible: boolean;
  notiVisible: boolean;
  notiSettings: boolean | null;
  cancelVisible: boolean;
  bannerVisible: boolean;
  updatable: boolean;
  tagsLoading: boolean;
  selectedTags: string[];
  originalTags: string[];
  toAdd: string[];
  toDelete: string[];
}

const initialState: MySubsState = {
  confirmVisible: false,
  notiVisible: false,
  notiSettings: null,
  cancelVisible: false,
  bannerVisible: false,
  updatable: false,
  tagsLoading: true,
  selectedTags: [],
  originalTags: [],
  toAdd: [],
  toDelete: [],
};

export const SET_MY_SUBS_STATE = 'setMySubsState';
export const MY_SUBS_STATE_RESET = 'setMySubsStateReset';

const reducer: Reducer<any, any> = (state, action) => {
  const { type, ...others } = action;
  switch (type) {
    case SET_MY_SUBS_STATE: {
      return {
        ...state,
        ...others,
      };
    }
    case MY_SUBS_STATE_RESET:
      return initialState;
  }
};

const useMySubsState = () => {
  const [mySubsState, mySubsDispatch] = useReducer(reducer, initialState);
  return { mySubsState, mySubsDispatch };
};

export default useMySubsState;
