import { PostNumbers, PostSavedObj } from '../types/store';

import { Alert } from 'react-native';
import { Dispatch } from 'react';
import { MutationFunction } from '@apollo/react-common';
import { POST_LIKES_LIMIT } from '../configs/variables';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import { produce } from 'immer';
import reportSentry from './reportSentry';

interface Args {
  userId: string;
  postId: string;
  // postCreatedAt: string;
  postNumbers: PostNumbers;
  storeDispatch: Dispatch<any>;
  postLikes: PostSavedObj | null;
  updatePostNumbers: MutationFunction;
}

const addPostLike = async ({
  userId,
  postId,
  // postCreatedAt,
  postNumbers,
  storeDispatch,
  postLikes,
  updatePostNumbers,
}: Args) => {
  let nextPostLikes: PostSavedObj;

  if (postLikes) {
    if (postLikes.count >= POST_LIKES_LIMIT) {
      Alert.alert(`최대 좋아요 가능 게시물 개수는 ${POST_LIKES_LIMIT}개 입니다`);
      reportSentry(`최대 좋아요 개수 초과_${userId}`);
      return;
    } else if (!postLikes[postId]) {
      nextPostLikes = produce(postLikes, draft => {
        draft.count = draft.count ? draft.count + 1 : 1;
        draft[postId] = true;
        draft.used = true;
      });
    } else return;
  } else {
    nextPostLikes = {
      used: true,
      count: 1,
      [postId]: true,
    };
  }

  const { numOfLikes, ...others } = postNumbers;

  try {
    await updatePostNumbers({
      variables: {
        id: postId,
        // postCreatedAt,
        toAdd: 'numOfLikes',
      },
      // optimisticResponse: {
      //   __typename: 'Mutation',
      //   updatePostNumbers: {
      //     __typename: 'Post',
      //     id: postId,
      //     // createdAt: postCreatedAt,
      //     numOfLikes: numOfLikes + 1,
      //     ...others,
      //   },
      // },
    });
    storeDispatch({ type: SET_AUTHSTORE_STATE, postLikes: nextPostLikes });
  } catch (e) {
    reportSentry(e);
  }
};

const removePostLike = async ({
  postId,
  // postCreatedAt,
  postNumbers,
  storeDispatch,
  postLikes,
  updatePostNumbers,
}: Args) => {
  if (postLikes) {
    if (!postLikes[postId]) {
      console.log('no there is no heart');
    } else {
      const nextPostLikes = produce(postLikes, draft => {
        delete draft[postId];
        draft.count = draft.count - 1;
        draft.used = true;
      });
      const { numOfLikes, ...others } = postNumbers;

      try {
        await updatePostNumbers({
          variables: {
            id: postId,
            // postCreatedAt,
            toDelete: 'numOfLikes',
          },
          // optimisticResponse: {
          //   __typename: 'Mutation',
          //   updatePostNumbers: {
          //     __typename: 'Post',
          //     id: postId,
          //     // createdAt: postCreatedAt,
          //     numOfLikes: numOfLikes - 1,
          //     ...others,
          //   },
          // },
        });
        storeDispatch({ type: SET_AUTHSTORE_STATE, postLikes: nextPostLikes });
      } catch (e) {
        reportSentry(e);
      }
    }
  } else {
    throw Error('problem');
  }
};

const resetPostLike = ({ storeDispatch, postLikes }: Partial<Args>) => {
  if (postLikes && postLikes.count > 0) {
    const nextPostLikes = {
      count: 0,
      used: true,
    };
    storeDispatch!({ type: SET_AUTHSTORE_STATE, postLikes: nextPostLikes });
  }
};

export { addPostLike, removePostLike, resetPostLike };
