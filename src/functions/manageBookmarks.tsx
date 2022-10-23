import { Alert } from 'react-native';
import { BOOKMARK_LIMIT } from '../configs/variables';
import { Bookmarks } from '../types/store';
import { Dispatch } from 'react';
import { MutationFunction } from '@apollo/react-common';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import { produce } from 'immer';
import reportSentry from '../functions/reportSentry';

interface Args {
  userId: string;
  classId: string;
  storeDispatch: Dispatch<any>;
  bookmark: Bookmarks | null;
  updateBookmark: MutationFunction;
}

const addBookmark = async ({ userId, classId, storeDispatch, bookmark, updateBookmark }: Args) => {
  let nextBookmark: Bookmarks;

  if (bookmark) {
    if (bookmark.count >= BOOKMARK_LIMIT) {
      Alert.alert(
        `게시물 북마크 한도 초과`,
        `클래스 북마크 최대 개수는 ${BOOKMARK_LIMIT}개 입니다. 기존 북마크를 정리 후 다시 시도하세요`,
      );
      return;
    } else if (bookmark[classId] === undefined) {
      nextBookmark = produce(bookmark, draft => {
        draft.count = draft.count ? draft.count + 1 : 1;
        draft[classId] = true;
        draft.used = true;
      });
    } else return;
  } else {
    nextBookmark = {
      used: true,
      count: 1,
      [classId]: true,
    };
  }

  try {
    await updateBookmark({ variables: { userId, toAdd: classId } });
    storeDispatch({ type: SET_AUTHSTORE_STATE, bookmark: nextBookmark });
  } catch (e) {
    reportSentry(e);
    Alert.alert('북마크 추가 실패');
  }
};

const removeBookmark = async ({ userId, classId, storeDispatch, bookmark, updateBookmark }: Args) => {
  if (bookmark) {
    if (bookmark[classId] === undefined) {
      console.log('no there is no bookmark');
    } else {
      const nextBookmark = produce(bookmark, draft => {
        delete draft[classId];
        draft.count = draft.count - 1;
        draft.used = true;
      });
      try {
        await updateBookmark({ variables: { userId, toDelete: classId } });
        storeDispatch({ type: SET_AUTHSTORE_STATE, bookmark: nextBookmark });
      } catch (e) {
        reportSentry(e);
        Alert.alert('북마크 삭제 실패');
      }
    }
  } else {
    reportSentry(new Error('no bookmark but tried to remove'));
  }
};

const resetBookmarks = async ({ userId, storeDispatch, bookmark, updateBookmark }: Partial<Args>) => {
  if (bookmark && bookmark.count > 0) {
    const nextBookmark = {
      count: 0,
      used: true,
    };
    try {
      await updateBookmark!({ variables: { userId, reset: true } });
      storeDispatch!({ type: SET_AUTHSTORE_STATE, bookmark: nextBookmark });
    } catch (e) {
      reportSentry(e);
      Alert.alert('북마크 리셋 실패');
    }
  }
};

export { addBookmark, removeBookmark, resetBookmarks };
