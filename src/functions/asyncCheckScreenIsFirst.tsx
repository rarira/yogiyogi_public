import { IsFirstObject, StoreAction } from '../types/store';

// import AsyncStorage from '@react-native-community/async-storage';
import { Dispatch } from 'react';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import produce from 'immer';

// import reportSentry from './reportSentry';

const asyncCheckScreenIsFirst = (
  // userName: string | null,
  screenName: string,
  store: IsFirstObject,
  storeDispatch: Dispatch<StoreAction>,
) => {
  if (store[screenName] === false) {
    return false;
  } else {
    const nextState = produce(store, draft => {
      draft[screenName] = false;
    });
    storeDispatch({ type: SET_AUTHSTORE_STATE, isFirst: nextState });

    return true;
  }
};

export default asyncCheckScreenIsFirst;
