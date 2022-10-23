import { CommentNotiStatus, CommentStatus, UpdateCommentInput } from '../../API';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { customUpdatePostNumbers, updateCommentStatus } from '../../customGraphqls';
import theme, { getThemeColor } from '../../configs/theme';

import React from 'react';
import { WarningProps } from '../WarningDialog';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import { useMutation } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';

interface Props {
  commentId: string;
  createdAt: string;
  postId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setWarningProps?: (arg: Partial<WarningProps> | null) => void;
}

const UPDATE_COMMENT_STATUS = gql(updateCommentStatus);
const UPDATE_POST_NUMBERS = gql(customUpdatePostNumbers);

const CommentDeleteButton = ({ commentId, createdAt, postId, snackbarDispatch, setWarningProps }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const [updateCommentStatus, { loading: loading1 }] = useMutation(UPDATE_COMMENT_STATUS);
  const [updatePostNumbers, { loading: loading2 }] = useMutation(UPDATE_POST_NUMBERS);
  const _handleOnPress = () => {
    const _deleteComment = async () => {
      try {
        const input: UpdateCommentInput = {
          id: commentId,
          commentStatus: CommentStatus.DELETED,
          commentNotiStatus: CommentNotiStatus.DELETED,
          createdAt,
        };
        await updateCommentStatus({
          variables: { input },
          // update: (store, { data }) => {
          //   const dataId = `Comment:${commentId}`;
          //   const fragmentResult = store.readFragment({
          //     id: dataId,
          //     fragment: COMMENT_NUMBERS_FRAGMENT,
          //   });
          //   // console.log(fragmentResult, data);
          //   const { id, __typename, ...others } = data.updateCommentNumbers;
          //   // console.log(others);
          //   store.writeFragment({ id: dataId, fragment: COMMENT_NUMBERS_FRAGMENT, data: others });
          // },
        });
        await updatePostNumbers({
          variables: { id: postId, toDelete: 'numOfComments' },
        });
        await setWarningProps!(null);
      } catch (e) {
        snackbarDispatch({ type: OPEN_SNACKBAR, message: '댓글 삭제를 실패하였습니다' });
        reportSentry(e);
      }
    };

    setWarningProps!({
      dismissable: true,
      dialogTitle: '댓글 삭제',
      dialogContent: '한번 삭제하면 돌이킬 수 없습니다. 그래도 삭제하시겠습니까?',
      okText: '삭제하겠습니다',
      handleOk: _deleteComment,
      loading: loading1 || loading2,
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={_handleOnPress}>
      <Text style={[styles.buttonText, { color: getThemeColor('error', appearance) }]}>삭제</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: theme.size.normal,
  },
  buttonText: {
    fontSize: theme.fontSize.small,

    fontWeight: '600',
  },
});

export default CommentDeleteButton;
