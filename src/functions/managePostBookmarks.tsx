import { Alert } from 'react-native';
import { Dispatch } from 'react';
import { MutationFunction } from '@apollo/react-common';
import { POST_BOOKMARK_LIMIT } from '../configs/variables';
import { PostSavedObj } from '../types/store';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import { produce } from 'immer';
import reportSentry from '../functions/reportSentry';

interface Args {
  userId: string;
  postId: string;
  // postCreatedAt: string;
  storeDispatch: Dispatch<any>;
  postBookmark: PostSavedObj | null;
  updatePostBookmark: MutationFunction;
}

const addPostBookmark = async ({
  userId,
  postId,
  // postCreatedAt,
  storeDispatch,
  postBookmark,
  updatePostBookmark,
}: Args) => {
  let nextBookmark: PostSavedObj;

  if (postBookmark) {
    if (postBookmark.count >= POST_BOOKMARK_LIMIT) {
      Alert.alert(
        `게시물 북마크 한도 초과`,
        `게시물 북마크 최대 개수는 ${POST_BOOKMARK_LIMIT}개 입니다. 기존 북마크를 정리 후 다시 시도하세요`,
      );
      return;
    } else if (!postBookmark[postId]) {
      nextBookmark = produce(postBookmark, draft => {
        draft.count = draft.count ? draft.count + 1 : 1;
        draft[postId] = true;
        draft.used = true;
      });
    } else return;
  } else {
    nextBookmark = {
      used: true,
      count: 1,
      [postId]: true,
    };
  }

  try {
    if (!postBookmark?.used) {
      await updatePostBookmark({ variables: { userId, reset: true } });
    }
    await updatePostBookmark({
      variables: {
        userId,
        toAdd: postId,
        // postCreatedAt
      },
    });

    storeDispatch({ type: SET_AUTHSTORE_STATE, postBookmark: nextBookmark });
  } catch (e) {
    reportSentry(e);
    Alert.alert('북마크 추가 실패');
  }
};

const removePostBookmark = async ({
  userId,
  postId,
  storeDispatch,
  postBookmark,
  updatePostBookmark,
}: Partial<Args>) => {
  if (postBookmark) {
    if (!postBookmark[postId!]) {
      console.log('no there is no postBookmark');
    } else {
      const nextBookmark = produce(postBookmark, draft => {
        delete draft[postId!];
        draft.count = draft.count - 1;
        draft.used = true;
      });
      try {
        await updatePostBookmark!({ variables: { userId, toDelete: postId } });
        storeDispatch!({ type: SET_AUTHSTORE_STATE, postBookmark: nextBookmark });
      } catch (e) {
        reportSentry(e);
        Alert.alert('북마크 삭제 실패');
      }
    }
  } else {
    reportSentry(new Error('no postBookmark but tried to remove'));
  }
};

const resetPostBookmarks = async ({
  userId,

  storeDispatch,
  postBookmark,
  updatePostBookmark,
}: Partial<Args>) => {
  if (postBookmark && postBookmark.count > 0) {
    const nextBookmark = {
      count: 0,
      used: true,
    };
    try {
      await updatePostBookmark!({ variables: { userId, reset: true } });
      storeDispatch!({ type: SET_AUTHSTORE_STATE, postBookmark: nextBookmark });
    } catch (e) {
      reportSentry(e);
      Alert.alert('북마크 리셋 실패');
    }
  }
};

export { addPostBookmark, removePostBookmark, resetPostBookmarks };
