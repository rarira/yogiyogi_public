import { HeartClassData, Hearts } from '../types/store';

import { Alert } from 'react-native';
import { Dispatch } from 'react';
import { HEARTS_LIMIT } from '../configs/variables';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import { produce } from 'immer';
import wait from './wait';

interface Args {
  item: HeartClassData;
  storeDispatch: Dispatch<any>;
  hearts: Hearts | null;
}

const addHeart = ({ item, storeDispatch, hearts }: Args): void => {
  let nextHearts: Hearts;

  if (hearts) {
    if (hearts.count >= HEARTS_LIMIT) {
      Alert.alert(`관심 클래스 저장 최대 개수는 ${HEARTS_LIMIT}개 입니다`);
      return;
    } else if (hearts[item.id] === undefined) {
      nextHearts = produce(hearts, draft => {
        draft.count = draft.count ? draft.count + 1 : 1;
        draft[item.id] = item;
        draft.used = true;
      });
    } else return;
  } else {
    nextHearts = {
      used: true,
      count: 1,
      [item.id]: item,
    };
  }

  storeDispatch({ type: SET_AUTHSTORE_STATE, hearts: nextHearts, heartsUpdated: true });
  wait(500).then(() => {
    storeDispatch({ type: SET_AUTHSTORE_STATE, heartsUpdated: false });
  });
};

const removeHeart = ({ item, storeDispatch, hearts }: Args) => {
  if (hearts) {
    if (hearts[item.id] === undefined) {
      console.log('no there is no heart');
    } else {
      const nextHearts = produce(hearts, draft => {
        delete draft[item.id];
        draft.count = draft.count - 1;
        draft.used = true;
      });
      storeDispatch({ type: SET_AUTHSTORE_STATE, hearts: nextHearts });
    }
  } else {
    throw Error('problem');
  }
};

const resetHearts = ({ storeDispatch, hearts }: Partial<Args>) => {
  if (hearts && hearts.count > 0) {
    const nextHearts = {
      count: 0,
      used: true,
    };
    storeDispatch!({ type: SET_AUTHSTORE_STATE, hearts: nextHearts });
  }
};

export { addHeart, removeHeart, resetHearts };
