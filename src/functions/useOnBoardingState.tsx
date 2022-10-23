import { Reducer, useReducer } from 'react';

export enum CarouselTimeOption {
  ALL = 'all',
  NEW = 'new',
  SOON = 'soon',
}
export interface OnBoardingState {
  isAuthenticated: boolean;
  isCollapsedTime: boolean;
  choosedTag: string | null;
  choosedTimeOption: CarouselTimeOption;
  lastCardCreatedAtEpoch: number | null;
  currentIndex: number;
}

const initialState: OnBoardingState = {
  isAuthenticated: false,
  isCollapsedTime: true,
  choosedTag: null,
  choosedTimeOption: CarouselTimeOption.ALL,
  lastCardCreatedAtEpoch: null,
  currentIndex: 0,
};

export const SET_ON_BOARDING_STATE = 'setOnBoardingState';
export const ON_BOARDING_STATE_RESET = 'setOnBoardingStateReset';

const reducer: Reducer<any, any> = (state, action) => {
  const { type, ...others } = action;
  switch (type) {
    case SET_ON_BOARDING_STATE: {
      return {
        ...state,
        ...others,
      };
    }

    case ON_BOARDING_STATE_RESET:
      return initialState;
  }
};

const useOnBoardingState = () => {
  const [onBoardingState, onBoardingDispatch] = useReducer(reducer, initialState);
  return { onBoardingState, onBoardingDispatch };
};

export default useOnBoardingState;
