import React, { memo, useEffect, useState } from 'react';
import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import { addBookmark, removeBookmark } from '../functions/manageBookmarks';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { customUpdateBookmark } from '../customGraphqls';
import gql from 'graphql-tag';

import { useMutation } from '@apollo/react-hooks';
import { getTheme } from '../configs/theme';

interface Props extends TouchableWithoutFeedbackProps {
  parallaxHeaderVisible?: boolean;
  needMarginRight?: boolean;
  setNeedAuthVisible?: (arg: boolean) => void;
  classId: string;
  size?: number;
}

const UPDATE_BOOKMARK = gql(customUpdateBookmark);

const BookmarkButton = ({
  needMarginRight,
  parallaxHeaderVisible,
  setNeedAuthVisible,
  classId,
  size,
  ...rest
}: Props) => {
  const [bookmarked, setBookmarked] = useState(false);

  const [updateBookmark] = useMutation(UPDATE_BOOKMARK);

  const {
    authStore: { user, bookmark, appearance },
  } = useStoreState();

  const storeDispatch = useStoreDispatch();
  const theme = getTheme(appearance);
  useEffect(() => {
    let _mounted = true;
    if (!!user && _mounted) {
      const temp = bookmark[classId] ? true : false;
      setBookmarked(temp);
    }
    return () => {
      _mounted = true;
    };
  }, [bookmark]);

  // console.log('reload, ', bookmarked, classId);

  const _handleOnPress = () => {
    if (!user) {
      setNeedAuthVisible!(true);
    } else if (!bookmarked) {
      addBookmark({ userId: user.username, storeDispatch, classId, updateBookmark, bookmark });
    } else {
      removeBookmark({ userId: user.username, storeDispatch, classId, updateBookmark, bookmark });
    }
  };

  const color = bookmarked
    ? theme.colors.red
    : parallaxHeaderVisible
    ? theme.colors.background
    : theme.colors.placeholder;
  const iconName = bookmarked ? 'bookmark' : 'bookmark-border';

  // if (!user) return null;
  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      {...(needMarginRight && { style: { marginRight: theme.size.medium } })}
    >
      <Icon name={iconName} size={size || theme.iconSize.big} color={color} />
    </TouchableOpacity>
  );
};

export default memo(BookmarkButton);
