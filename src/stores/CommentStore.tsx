import {
  CANCEL_COMMENT_INPUT,
  COMMENT_STATE_RESET,
  PREPARE_REPLY_TO_COMMENT,
  PREPARE_UPDATE_COMMENT,
  SET_COMMENT_STATE,
} from './actionTypes';
import { CommentStoreType, StoreAction } from '../types/store';

export const commentInitialState: CommentStoreType = {
  postId: undefined,
  postAuthorId: undefined,
  postTitle: undefined,
  // screenName: undefined,
  commentViewAddedToId: undefined,
  commentViewAuthorId: undefined,
  editComment: undefined,
  replyToComment: undefined,
  notiCommentId: undefined,
  // origin: undefined,
  content: undefined,
  // prefix: undefined,
  // receiverId: undefined,
  receiverName: undefined,
  // reset: false,
};

export const commentReducer = (state: CommentStoreType, action: StoreAction) => {
  const { type, ...others } = action;
  switch (type) {
    case SET_COMMENT_STATE: {
      return {
        ...state,
        ...others,
      };
    }
    // case CREATE_COMMENT_FINISHED: {
    //   return {
    //     ...state,
    //     content: undefined,
    //     receiverId: undefined,
    //     receiverName: undefined,
    //     ...others,
    //   };
    // }
    // case UPDATE_COMMENT_FINISHED: {
    //   return {
    //     ...state,
    //     editComment: undefined,
    //     content: undefined,
    //     receiverName: undefined,
    //     receiverId: undefined,
    //     ...others,
    //   };
    // }
    // case REPLY_TO_COMMENT_FINISHED: {
    //   return {
    //     ...state,
    //     replyToComment: undefined,
    //     content: undefined,
    //     receiverName: undefined,
    //     receiverId: undefined,
    //     ...others,
    //   };
    // }
    case CANCEL_COMMENT_INPUT: {
      return {
        ...state,
        editComment: undefined,
        replyToComment: undefined,
        content: undefined,
        receiverName: undefined,
        notiCommentId: undefined,
        // commentViewAddedToId: undefined,
        // commentViewAuthorId: undefined,
        // receiverId: undefined,

        ...others,
      };
    }
    case PREPARE_UPDATE_COMMENT: {
      return {
        ...state,
        replyToComment: undefined,
        content: undefined,
        receiverName: undefined,
        notiCommentId: undefined,
        // receiverId: undefined,
        ...others,
      };
    }
    case PREPARE_REPLY_TO_COMMENT: {
      return {
        ...state,
        editComment: undefined,
        content: undefined,
        receiverName: undefined,
        notiCommentId: undefined,
        // receiverId: undefined,
        ...others,
      };
    }

    case COMMENT_STATE_RESET:
      return commentInitialState;
    default:
      return state;
  }
};
