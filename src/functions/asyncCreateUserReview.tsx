import { CreateUserReviewInput, ReviewType, SatisfactionType } from '../API';
import { MySnackbarAction, OPEN_SNACKBAR } from '../components/MySnackbar';

import { DataProxy } from 'apollo-cache';
import { MutationFunction } from '@apollo/react-common';
import { customGetUserProfile } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from './reportSentry';
import uuidv4 from 'uuid/v4';

const GET_USER_PROFILE = gql(customGetUserProfile);

interface Args {
  createUserReview: MutationFunction;
  reviewerId: string;
  revieweeId: string;
  reviewType: ReviewType;
  satisfactionState: SatisfactionType;
  choosedManners: string[];
  snackbarDispatch: (arg: MySnackbarAction) => void;
  backToOrigin: () => void;
  content?: string;
}

const asyncCreateUserReview = ({
  createUserReview,
  reviewerId,
  revieweeId,
  reviewType,
  satisfactionState,
  choosedManners,
  content,
  snackbarDispatch,
  backToOrigin,
}: Args) => async () => {
  const reviewId = uuidv4();

  const createClassUserInput: CreateUserReviewInput = {
    createClassReview: {
      id: reviewId,
      type: reviewType,
      satisfaction: satisfactionState,
      reviewsReviewerId: reviewerId,
      reviewsRevieweeId: revieweeId,
      // createdAt,
      manners: choosedManners,
      ...(content !== '' && { content }),
    },
  };

  try {
    await createUserReview({
      variables: {
        input: createClassUserInput,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        createUserReview: {
          __typename: 'Reviews',
          id: reviewId,
          type: reviewType,
          reviewsReviewerId: reviewerId,
          reviewsRevieweeId: revieweeId,
        },
      },
      update: (store: DataProxy) => {
        try {
          const queryResult: any = store.readQuery({ query: GET_USER_PROFILE, variables: { id: revieweeId } });

          const { mannerReviewed, ...others } = queryResult.getUser;
          const newMannerReviewed = (mannerReviewed || []).concat([reviewerId]);

          const newData = { getUser: { mannerReviewed: newMannerReviewed, ...others } };

          store.writeQuery({ query: GET_USER_PROFILE, variables: { id: revieweeId }, data: newData });
        } catch (e) {
          console.log(e);
        }
      },
    });

    snackbarDispatch({
      type: OPEN_SNACKBAR,
      message: '리뷰 작성을 완료하였습니다',
      sideEffect: backToOrigin,
      duration: 1000,
    });
  } catch (e) {
    reportSentry(e);
    throw e;
  }
};

export default asyncCreateUserReview;
