import { PostStatus, UpdatePostInput } from '../API';

import { MutationFunction } from '@apollo/react-common';
import reportSentry from './reportSentry';

const postStatusChange = (
  postId: string,
  // postCreatedAt: string,
  toBePostStatus: PostStatus,
  updatePostStatus: MutationFunction,
) => async () => {
  const input: UpdatePostInput = {
    id: postId,
    // createdAt: postCreatedAt,
    postStatus: toBePostStatus,
  };
  try {
    await updatePostStatus({
      variables: {
        input,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        updatePost: {
          __typename: 'Post',
          ...input,
        },
      },
    });
  } catch (e) {
    reportSentry(e);
  }
};

export default postStatusChange;
