import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import { addPostBookmark, removePostBookmark } from '../../functions/managePostBookmarks';
import theme, { getThemeColor } from '../../configs/theme';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { customUpdatePostBookmark } from '../../customGraphqls';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';

interface Props extends TouchableWithoutFeedbackProps {
  needMarginRight?: boolean;
  setNeedAuthVisible?: (arg: boolean) => void;
  postId: string;
  // postCreatedAt: string;
  size?: number;
}

const UPDATE_POST_BOOKMARK = gql(customUpdatePostBookmark);

const PostBookmarkButton = ({
  needMarginRight,

  setNeedAuthVisible,
  postId,
  // postCreatedAt,
  size,
  ...rest
}: Props) => {
  const [bookmarked, setBookmarked] = useState(false);

  const [updatePostBookmark] = useMutation(UPDATE_POST_BOOKMARK);

  const {
    authStore: { user, postBookmark, appearance },
  } = useStoreState();

  const storeDispatch = useStoreDispatch();

  useEffect(() => {
    let _mounted = true;
    if (!!user && _mounted) {
      const temp = postBookmark[postId] ? true : false;
      setBookmarked(temp);
    }
    return () => {
      _mounted = true;
    };
  }, [postBookmark]);

  // console.log('reload, ', bookmarked, postId);

  const _handleOnPress = () => {
    if (!user) {
      setNeedAuthVisible!(true);
    } else if (!bookmarked) {
      addPostBookmark({
        userId: user.username,
        storeDispatch,
        postId,
        // postCreatedAt,
        updatePostBookmark,
        postBookmark,
      });
    } else {
      removePostBookmark({ userId: user.username, storeDispatch, postId, updatePostBookmark, postBookmark });
    }
  };

  const color = bookmarked ? getThemeColor('accent', appearance) : getThemeColor('placeholder', appearance);
  const iconName = bookmarked ? 'bookmark' : 'bookmark-border';
  // if (!user) return null;
  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      {...(needMarginRight && { style: styles.mediumMarginRight })}
    >
      <Icon name={iconName} size={size || theme.iconSize.big} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mediumMarginRight: { marginRight: theme.size.medium },
});

export default PostBookmarkButton;
//  memo(PostBookmarkButton, isEqual);
