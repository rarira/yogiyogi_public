import { Bookmarks, PostSavedObj } from '../types/store';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { customUpdateBookmark, customUpdatePostBookmark } from '../customGraphqls';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import KoreanParagraph from './KoreanParagraph';
import Loading from './Loading';
import gql from 'graphql-tag';
import { resetBookmarks } from '../functions/manageBookmarks';
import { resetPostBookmarks } from '../functions/managePostBookmarks';

import { useMutation } from '@apollo/react-hooks';
import { getTheme } from '../configs/theme';

const UPDATE_BOOKMARK = gql(customUpdateBookmark);
const UPDATE_POST_BOOKMARK = gql(customUpdatePostBookmark);

interface Props {
  index: number;
}

const BookmarkClearButton = ({ index }: Props) => {
  const {
    authStore: { user, bookmark, postBookmark, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const gqlName = index === 0 ? UPDATE_BOOKMARK : UPDATE_POST_BOOKMARK;

  const [updateBookmark, { loading }] = useMutation(gqlName);

  const _handleOnPress = () => {
    // console.log('will reset');
    if (index === 0) {
      resetBookmarks({ userId: user.username, storeDispatch, bookmark, updateBookmark });
    } else {
      resetPostBookmarks({ userId: user.username, storeDispatch, postBookmark, updatePostBookmark: updateBookmark });
    }
  };

  if (loading) return <Loading size="small" origin={`BookmarkClearButton_${index}`} />;

  const disabled = index === 0 ? bookmark.count === 0 : postBookmark.count === 0;

  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
      disabled={disabled}
      // style={styles.container}
    >
      <KoreanParagraph
        textStyle={[styles.text, disabled && { color: theme.colors.disabled }]}
        text={'모두 삭제'}
        paragraphStyle={styles.paragraph}
      />
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center' },
    text: {
      color: theme.colors.error,
      fontSize: theme.fontSize.medium,
      marginLeft: theme.size.xs,
      // flexWrap: 'wrap',
    },
    paragraph: { flexWrap: 'nowrap' },
  });

export default memo(BookmarkClearButton);
