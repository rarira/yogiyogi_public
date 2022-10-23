// AuthStore action types
export const CHANGE_AUTH_STATE = 'changeAuthState';
export const USER_AUTHENTICATED = 'userAuthenticated';
export const USER_SIGNED_OUT = 'userSignedOut';
export const RESET_AUTH_STORE = 'resetAuthStore';
export const SET_BOOKMARKS = 'setBookmarks';
export const SET_HISTORY = 'setHistory';
export const SET_ONESIGNAL_TAGS = 'setOneSignalTags';
export const QUERY_HISTORY = 'queryHistory';
export const CHANGE_APP_STATE = 'changeAppState';
export const SET_PROFILE_UPDATED = 'setProfileUpdated';
export const SET_SUBSCRIBED_TAGS = 'setSubscribedTags';
export const SET_NEW_CLASS_NOTIS = 'setNewClassNotis';
export const CHANGE_NEW_NOTIS = 'changeNewNotis';
export const SET_AUTHSTORE_STATE = 'setAuthStoreState';
export const SET_POST_BOOKMARKS = 'setPostBookmarks';
export const SET_POST_LIKES = 'setPostLikes';

// CenterStore action types
export const CHANGE_CENTER_SELECTED = 'changeCenterSelected';
export const CHANGE_ADDRESS_SELECTED = 'changeAddressSelected';
export const UPDATE_ADDRESS_SELECTED = 'updateAddressSelected';
export const CHOOSE_RESELECT = 'chooseReselect';
export const CHANGE_REGISTER_CENTER_STATE = 'changeRegisterCenterState';
export const RESET_CENTER_STATE = 'resetCenterState';
export const REGISTER_MY_CENTER = 'registerMyCenters';

// ClassStore action types
export const CHANGE_ADD_CLASS_STATE = 'changeAddClassState';
export const RESET_CLASS_STATE = 'resetClassState';
export const EDIT_FROM_SUMMARY = 'editFromSummary';
export const PREPARE_UPDATE_CLASS = 'prepareUpdateClass';
export const PREPARE_REPOST_CLASS = 'prepareRepostClass';

// PostStore action types
export const SET_ADD_POST_STATE = 'setAddPostState';
export const ADD_POST_STATE_RESET = 'setAddPostStateReset';
export const CREATE_POST_FINISHED = 'createPostFinished';
export const PREPARE_UPDATE_POST = 'prepareUpdatePost';
export const UPDATE_POST_FINISHED = 'updatePostFinished';

// CommentStore action types
export const SET_COMMENT_STATE = 'setCommentState';
export const COMMENT_STATE_RESET = 'setCommentStateReset';
// export const CREATE_COMMENT_FINISHED = 'createCommentFinished';
export const PREPARE_UPDATE_COMMENT = 'prepareUpdateComment';
// export const UPDATE_COMMENT_FINISHED = 'updateCommentFinished';
export const PREPARE_REPLY_TO_COMMENT = 'prepareReplyToComment';
// export const REPLY_TO_COMMENT_FINISHED = 'replyToCommentFinished';
export const CANCEL_COMMENT_INPUT = 'cancelCommentInput';
