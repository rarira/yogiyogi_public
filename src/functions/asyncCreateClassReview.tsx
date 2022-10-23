import { ClassStatusType, CreateClassReviewInput, ReviewType, SatisfactionType } from '../API';
import { MySnackbarAction, OPEN_SNACKBAR } from '../components/MySnackbar';

import { END_OF_DAY } from '../configs/variables';
import { MutationFunction } from '@apollo/react-common';
import uuidv4 from 'uuid/v4';

interface Args {
  createClassReview: MutationFunction;
  classId: string;
  reviewerId: string;
  revieweeId: string;
  reviewType: ReviewType;
  satisfactionState: SatisfactionType;
  choosedManners: string[];
  snackbarDispatch: (arg: MySnackbarAction) => void;
  backToOrigin: () => void;
  content?: string;
}

const asyncCreateClassReview = ({
  createClassReview,
  classId,
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
  const classStatus = reviewType === ReviewType.proxyReview ? ClassStatusType.proxied : ClassStatusType.reviewed;

  const createClassReviewInput: CreateClassReviewInput = {
    classId,
    userId: revieweeId,
    classStatus,
    expiresAt: END_OF_DAY,
    createClassReview: {
      id: reviewId,
      type: reviewType,
      satisfaction: satisfactionState,
      reviewsReviewedClassId: classId,
      reviewsReviewerId: reviewerId,
      reviewsRevieweeId: revieweeId,
      // createdAt,
      manners: choosedManners,
      ...(content !== '' && { content }),
    },
    ...(reviewType === ReviewType.proxyReview && { proxyId: revieweeId }),
  };

  try {
    const result = await createClassReview({
      variables: {
        input: createClassReviewInput,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        pipelineCreateClassReview: {
          __typename: 'Reviews',
          id: reviewId,
          type: reviewType,
          reviewedClass: {
            __typename: 'Class',
            id: classId,
            classStatus,
            ...(reviewType === ReviewType.proxyReview
              ? { classProxyReviewId: reviewId }
              : { classHostReviewId: reviewId }),
          },
          reviewsRevieweeId: revieweeId,
        },
      },
    });

    snackbarDispatch({
      type: OPEN_SNACKBAR,
      message: '리뷰 작성을 완료하였습니다',
      sideEffect: backToOrigin,
      duration: 1000,
    });
  } catch (e) {
    // console.log(e);
    throw e;
  }
};

export default asyncCreateClassReview;
