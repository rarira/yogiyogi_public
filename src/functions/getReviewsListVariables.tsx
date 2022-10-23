import { ModelReviewsFilterInput, ModelSortDirection, ModelStringKeyConditionInput, ReviewType } from '../API';

const getReviewsListVariables = (userId: string, type: string) => {
  const tempObj: {
    reviewsRevieweeId: string;
    createdAt?: ModelStringKeyConditionInput;
    sortDirection?: ModelSortDirection;
    filter?: ModelReviewsFilterInput;
    limit?: number;
    nextToken?: string;
  } = { reviewsRevieweeId: userId, sortDirection: ModelSortDirection.DESC, limit: 100 };

  switch (type) {
    case 'allComments':
      tempObj.filter = {
        content: { ge: '\u0000' },
      };
      break;
    case 'hostComments':
      tempObj.filter = {
        and: [{ content: { ge: '\u0000' } }, { type: { eq: ReviewType.hostReview } }],
      };
      break;
    case 'proxyComments':
      tempObj.filter = {
        and: [{ content: { ge: '\u0000' } }, { type: { eq: ReviewType.proxyReview } }],
      };
      break;
    case 'mannersComments':
      tempObj.filter = {
        and: [{ content: { ge: '\u0000' } }, { type: { eq: ReviewType.mannerReview } }],
      };
      break;

    default:
      break;
  }
  return tempObj;
};

export default getReviewsListVariables;
