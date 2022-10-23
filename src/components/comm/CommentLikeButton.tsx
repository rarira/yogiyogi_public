import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import React from 'react';
import { customUpdateCommentNumbers } from '../../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import { useMutation } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';

interface Props {
  commentId: string;
  likedUsers: string[] | null;
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const UPDATE_COMMENT_NUMBERS = gql(customUpdateCommentNumbers);
// const COMMENT_NUMBERS_FRAGMENT = gql(commentNumbersFragment);
const CommentLikeButton = ({ commentId, likedUsers, snackbarDispatch }: Props) => {
  const {
    authStore: {
      user: { username },
      appearance,
    },
  } = useStoreState();
  const isLiked = !!likedUsers && likedUsers.includes(username);

  const [updateCommentNumbers] = useMutation(UPDATE_COMMENT_NUMBERS);

  const _handleOnPress = async () => {
    try {
      const fieldName = isLiked ? 'delLike' : 'addLike';
      await updateCommentNumbers({
        variables: { commentId, userId: username, [fieldName]: true },
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
      snackbarDispatch({ type: OPEN_SNACKBAR, message: '좋아요 처리를 실패하였습니다' });
      reportSentry(e);
    }
  };

  return (
    <TouchableOpacity onPress={_handleOnPress}>
      <Text
        style={[
          styles.buttonText,

          isLiked
            ? { color: getThemeColor('iosBlue', appearance), fontWeight: 'bold' }
            : { color: getThemeColor('placeholder', appearance), fontWeight: '600' },
        ]}
      >
        좋아요
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    fontSize: theme.fontSize.small,
  },
});

export default CommentLikeButton;
