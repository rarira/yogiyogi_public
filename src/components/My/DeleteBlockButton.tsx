import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { customDeleteClassBlock, customDeletePostBlock, customDeleteUserBlock } from '../../customGraphqls';

import React from 'react';
import gql from 'graphql-tag';
import { memo } from 'react';
import remove from 'lodash/remove';
import reportSentry from '../../functions/reportSentry';
import { useMutation } from '@apollo/react-hooks';
import ThemedButton from '../ThemedButton';

interface Props {
  myId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  blockedBy: string[];
  classId?: string;
  userId?: string;
  postId?: string;
  updateQuery: any;
}

const DELETE_CLASS_BLOCK = gql(customDeleteClassBlock);
const DELETE_USER_BLOCK = gql(customDeleteUserBlock);
const DELETE_POST_BLOCK = gql(customDeletePostBlock);

const DeleteBlockButton = ({ myId, snackbarDispatch, classId, userId, postId, blockedBy, updateQuery }: Props) => {
  const isClassBlock = classId !== undefined;
  const isPostBlock = postId !== undefined;

  const [deleteBlock, { loading }] = useMutation(
    isClassBlock ? DELETE_CLASS_BLOCK : isPostBlock ? DELETE_POST_BLOCK : DELETE_USER_BLOCK,
    {
      variables: {
        input: { blockedBy: myId, ...(isClassBlock ? { classId } : isPostBlock ? { postId } : { userId }) },
      },
    },
  );
  const _handleOnDelete = async () => {
    try {
      const id = isClassBlock ? classId : isPostBlock ? postId : userId;
      const tempArray = remove(blockedBy, item => item !== id);
      await deleteBlock({
        optimisticResponse: {
          __typename: 'Mutation',
          [isClassBlock ? 'deleteClassBlock' : isPostBlock ? 'deletePostBlock' : 'deleteUserBlock']: {
            __typename: isClassBlock ? 'Class' : isPostBlock ? 'Post' : 'User',
            id,
            blockedBy: tempArray,
          },
        },
      });
      await updateQuery((prevResult: any) => {
        const tempArray = remove(
          isClassBlock
            ? prevResult.getUser.blockedClass
            : isPostBlock
            ? prevResult.getUser.blockedPost
            : prevResult.getUser.blockedUser,
          item => item !== id,
        );
        const newData = {
          getUser: {
            ...prevResult.getUser,
            [isClassBlock ? 'blockedClass' : isPostBlock ? 'blockedPost' : 'blockedUser']: tempArray,
          },
        };

        return newData;
      });
      snackbarDispatch({ type: OPEN_SNACKBAR, message: '차단 해제 성공', duration: 500 });
      // setBlocked(false);
    } catch (e) {
      reportSentry(e);
      snackbarDispatch({ type: OPEN_SNACKBAR, message: e.message, duration: 500 });
    }
  };

  return (
    <ThemedButton mode="outlined" onPress={_handleOnDelete} compact loading={loading}>
      차단 해제
    </ThemedButton>
  );
};

export default memo(DeleteBlockButton);
