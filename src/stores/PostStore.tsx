import {
  ADD_POST_STATE_RESET,
  CREATE_POST_FINISHED,
  PREPARE_UPDATE_POST,
  SET_ADD_POST_STATE,
  UPDATE_POST_FINISHED,
} from './actionTypes';
import { PostStoreType, StoreAction } from '../types/store';

import { PostCategory } from '../API';

export const postInitialState: PostStoreType = {
  postId: undefined,
  // postCreatedAt: undefined,
  postTitle: '',
  postCategory: PostCategory.misc,
  postLink: undefined,
  postPictureKeys: [],
  postTags: [],
  postContent: '',
  thumbnailURL: undefined,
  cancelVisible: false,
  dialogVisible: false,
  updateMode: false,
  toRemovePicture: [],
};

export const postReducer = (state: PostStoreType, action: StoreAction) => {
  const { type, ...others } = action;
  switch (type) {
    case SET_ADD_POST_STATE: {
      return {
        ...state,
        ...others,
      };
    }
    case CREATE_POST_FINISHED: {
      return {
        ...postInitialState,
        dialogVisible: true,
        ...others,
      };
    }
    case UPDATE_POST_FINISHED: {
      return {
        ...postInitialState,
        updateMode: true,
        dialogVisible: true,
        ...others,
      };
    }

    case PREPARE_UPDATE_POST:
      return {
        ...postInitialState,
        updateMode: true,
        ...others,
      };
    case ADD_POST_STATE_RESET:
      return postInitialState;
    default:
      return state;
  }
};
