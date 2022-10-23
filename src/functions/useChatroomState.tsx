import { ClassData, UserData } from '../types/apiResults';
import { Reducer, useReducer } from 'react';

export interface ChatroomState {
  isFirstTime: boolean;
  // isEmpty: boolean;
  // isFocused: boolean;
  chatroomStatus: string;
  partner: Partial<UserData> | null;
  partnerState: string | null;
  blockedBy: string | null;
  user1exited: string | null;
  user2exited: string | null;
  onClass: Partial<ClassData> | null;
}

const initialState: ChatroomState = {
  isFirstTime: false,
  // isEmpty: false,
  // isFocused: false,
  chatroomStatus: 'noChatroom',
  partner: null,
  partnerState: null,
  blockedBy: null,
  user1exited: null,
  user2exited: null,
  onClass: null,
};

export const SET_CHATROOM_INIT = 'setIsFirstTime';
export const SET_CHATROOM_STATE = 'setChatroomState';
export const SET_CHATROOM_CLASS_STATUS = 'setChatroomClassStatus';
export const CHATROOM_RESET = 'setChatroomReset';

const reducer: Reducer<any, any> = (state, action) => {
  const { type, ...others } = action;
  switch (type) {
    case SET_CHATROOM_STATE: {
      return {
        ...state,
        ...others,
      };
    }
    case SET_CHATROOM_CLASS_STATUS: {
      return {
        ...state,
        onClass: {
          ...state.onClass,
          classStatus: others.classStatus,
        },
      };
    }
    case SET_CHATROOM_INIT:
      return {
        ...initialState,
        ...others,
        isFirstTime: state.isFirstTime,
        // isEmpty: state.isEmpty,
      };
    case CHATROOM_RESET:
      return initialState;
  }
};

const useChatroomState = () => {
  const [chatroomState, chatroomDispatch] = useReducer(reducer, initialState);
  return { chatroomState, chatroomDispatch };
};

export default useChatroomState;
