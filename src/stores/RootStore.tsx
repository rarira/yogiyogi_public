import {
  AuthStoreType,
  CenterStoreType,
  ClassStoreType,
  CommentStoreType,
  PostStoreType,
  StoreAction,
} from '../types/store';
import { authInitialState, authReducer } from './AuthStore';
import { centerInitialState, centerReducer } from './CenterStore';
import { classInitialState, classReducer } from './ClassStore';
import { commentInitialState, commentReducer } from './CommentStore';
import { postInitialState, postReducer } from './PostStore';

export const rootInitialState = {
  authStore: authInitialState,
  centerStore: centerInitialState,
  classStore: classInitialState,
  postStore: postInitialState,
  commentStore: commentInitialState,
};

export const rootReducer = (
  {
    authStore,
    postStore,
    centerStore,
    classStore,
    commentStore,
  }: {
    authStore: AuthStoreType;
    postStore: PostStoreType;
    centerStore: CenterStoreType;
    classStore: ClassStoreType;
    commentStore: CommentStoreType;
  },
  action: StoreAction,
) => ({
  authStore: authReducer(authStore, action),
  postStore: postReducer(postStore, action),
  centerStore: centerReducer(centerStore, action),
  classStore: classReducer(classStore, action),
  commentStore: commentReducer(commentStore, action),
});
