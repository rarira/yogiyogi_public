import { AppearanceType, AuthStoreType, StoreAction } from '../types/store';
import {
  CHANGE_APP_STATE,
  CHANGE_AUTH_STATE,
  CHANGE_NEW_NOTIS,
  QUERY_HISTORY,
  RESET_AUTH_STORE,
  SET_AUTHSTORE_STATE,
  SET_BOOKMARKS,
  SET_HISTORY,
  SET_NEW_CLASS_NOTIS,
  SET_ONESIGNAL_TAGS,
  SET_PROFILE_UPDATED,
  SET_SUBSCRIBED_TAGS,
  USER_AUTHENTICATED,
  USER_SIGNED_OUT,
} from './actionTypes';

import { Appearance } from 'react-native';

export const authInitialState: AuthStoreType = {
  authState: 'notAuthenticated',
  profileName: null,
  profileUpdated: false,
  identityId: null,
  user: null,
  error: '',
  message: '',
  authInfo: null,
  bookmark: null,
  postBookmark: null,
  simpleSearchHistory: null,
  detailSearchHistory: null,
  appState: 'active',
  subscribedTags: null,
  newClassNotis: null,
  newPostNotis: null,
  newGenNotisAvailable: false,
  newCommNotisAvailable: false,
  newClassNotisAvailable: false,
  newPostNotisAvailable: false,
  newChats: [],
  oneSignalTags: null,
  lastReadClassAt: null,
  lastSubscribedTagsUpdated: null,
  hearts: null,
  postLikes: null,
  heartsUpdated: false,
  isFirst: {},
  isInternetReachable: true,
  isOnBoardingFinished: false,
  isNewButtonTouched: false,
  readyToServe: false,
  appearance: Appearance.getColorScheme(),
};

export const authReducer = (state: AuthStoreType, action: StoreAction) => {
  const { type, ...others } = action;

  switch (type) {
    case USER_SIGNED_OUT:
      return {
        ...authInitialState,
        hearts: others.hearts,
      };
    case CHANGE_AUTH_STATE:
      return {
        ...state,
        authState: others.authState || state.authState,
        authInfo: others.authInfo || state.authInfo,
      };
    case USER_AUTHENTICATED:
      return {
        ...authInitialState,
        user: others.user,
        authState: 'signedIn',
        authInfo: {
          origin: state.authInfo ? state.authInfo.origin : undefined,
        },
        ...others,
      };
    case RESET_AUTH_STORE:
      return authInitialState;
    case SET_BOOKMARKS:
      return {
        ...state,
        ...others,
      };
    case SET_SUBSCRIBED_TAGS:
      return {
        ...state,
        ...others,
      };
    case SET_ONESIGNAL_TAGS:
      return {
        ...state,
        ...others,
      };
    case SET_NEW_CLASS_NOTIS:
      return {
        ...state,
        ...others,
      };
    case CHANGE_NEW_NOTIS:
      return {
        ...state,
        ...others,
      };
    case SET_HISTORY:
      return {
        ...state,
        ...others,
      };
    case QUERY_HISTORY:
      return {
        ...state,
        ...others,
      };
    case CHANGE_APP_STATE:
      return {
        ...state,
        ...others,
      };
    case SET_PROFILE_UPDATED:
      return {
        ...state,
        profileUpdated: true,
        ...others,
      };
    case SET_AUTHSTORE_STATE:
      return {
        ...state,
        ...others,
      };
    default:
      return state;
  }
};
