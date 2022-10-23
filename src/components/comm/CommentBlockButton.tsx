import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import React from 'react';
import { WarningProps } from '../WarningDialog';
import { customUpdateCommentNumbers } from '../../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import { useMutation } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';

interface Props {
  commentId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setWarningProps?: (arg: Partial<WarningProps> | null) => void;
}

const UPDATE_COMMENT_NUMBERS = gql(customUpdateCommentNumbers);
// const COMMENT_NUMBERS_FRAGMENT = gql(commentNumbersFragment);
const CommentBlockButton = ({ commentId, snackbarDispatch, setWarningProps }: Props) => {
  const {
    authStore: {
      user: { username },
      appearance,
    },
  } = useStoreState();

  const [updateCommentNumbers, { loading }] = useMutation(UPDATE_COMMENT_NUMBERS);

  const _handleOnPress = () => {
    const _handleOK = async () => {
      try {
        // const fieldName = isBlocked ? 'delLike' : 'addLike';
        await updateCommentNumbers({
          variables: { commentId, userId: username, addBlock: true },
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
      } catch (e) {
        snackbarDispatch({ type: OPEN_SNACKBAR, message: '차단 처리를 실패하였습니다' });
        reportSentry(e);
      }
    };

    setWarningProps!({
      dialogTitle: '댓글 차단',
      dialogContent: '차단한 댓글은 돌이킬 수 없습니다. 그래도 차단하시겠습니까?',
      okText: '차단합니다',
      handleOk: _handleOK,
      loading,
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={_handleOnPress}>
      <Text style={[styles.buttonText, { color: getThemeColor('placeholder', appearance) }]}>차단</Text>
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

export default CommentBlockButton;
