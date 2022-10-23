import { Reducer, useReducer } from 'react';

export enum CarouselTimeOption {
  ALL = 'all',
  NEW = 'new',
  SOON = 'soon',
}
export interface HomeState {
  isCollapsedTag: boolean;
  isCollapsedTime: boolean;
  choosedTag: string[] | null;
  choosedTimeOption: CarouselTimeOption;
  lastCardCreatedAtEpoch: number | null;
  currentIndex: number;
}

const initialState: HomeState = {
  isCollapsedTag: true,
  isCollapsedTime: true,
  choosedTag: null,
  choosedTimeOption: CarouselTimeOption.NEW,
  lastCardCreatedAtEpoch: null,
  currentIndex: 0,
};

export const SET_HOME_STATE = 'setHomeState';
export const HOME_STATE_RESET = 'setHomeStateReset';
export const TOGGLE_IS_COLLAPSED_TAG_VISIBLE = 'toggleTagVisible';
export const TOGGLE_IS_COLLAPSED_TIME_VISIBLE = 'toggleTimeVisible';

const reducer: Reducer<any, any> = (state, action) => {
  const { type, ...others } = action;
  switch (type) {
    case SET_HOME_STATE: {
      return {
        ...state,
        ...others,
      };
    }
    case TOGGLE_IS_COLLAPSED_TAG_VISIBLE: {
      return {
        ...state,
        isCollapsedTag: !state.isCollapsedTag,
        isCollapsedTime: true,
      };
    }
    case TOGGLE_IS_COLLAPSED_TIME_VISIBLE: {
      return {
        ...state,
        isCollapsedTime: !state.isCollapsedTime,
        isCollapsedTag: true,
      };
    }
    case HOME_STATE_RESET:
      return initialState;
  }
};

const useHomeState = () => {
  const [homeState, homeDispatch] = useReducer(reducer, initialState);

  return { homeState, homeDispatch };
};

export default useHomeState;
