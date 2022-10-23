import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import { addPostLike, removePostLike } from '../../functions/managePostLikes';
import theme, { getThemeColor } from '../../configs/theme';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PostNumbers } from '../../types/store';
import { customUpdatePostNumbers } from '../../customGraphqls';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';

interface Props extends TouchableWithoutFeedbackProps {
  needMarginRight?: boolean;
  postId: string;
  // postCreatedAt: string;
  postNumbers: PostNumbers;
  size?: number;
  setNeedAuthVisible?: (arg: boolean) => void;
}

const UPDATE_POST_NUMBERS = gql(customUpdatePostNumbers);

const PostLikeButton = ({
  needMarginRight,

  postId,
  // postCreatedAt,
  postNumbers,
  size,
  setNeedAuthVisible,
  ...rest
}: Props) => {
  const [liked, setLiked] = useState(false);
  const [updatePostNumbers, { loading }] = useMutation(UPDATE_POST_NUMBERS);
  const {
    authStore: { user, postLikes, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  useEffect(() => {
    let _mounted = true;
    if (_mounted && postLikes) {
      const temp = postLikes[postId] ? true : false;
      setLiked(temp);
    }
    return () => {
      _mounted = false;
    };
  }, [postLikes]);

  // console.log('reload, ', bookmarked, item);

  const _handleOnPress = () => {
    const args = {
      userId: !!user ? user.username : '',
      postId,
      // postCreatedAt,
      postNumbers,
      postLikes,
      storeDispatch,
      updatePostNumbers,
    };

    if (!user) {
      setNeedAuthVisible!(true);
    } else if (liked) {
      removePostLike(args);
    } else {
      addPostLike(args);
    }
  };

  const color = liked ? getThemeColor('accent', appearance) : getThemeColor('placeholder', appearance);

  const iconName = liked ? 'thumb-up' : 'thumb-up-outline';

  // if (!user) return null;
  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      disabled={loading}
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

export default PostLikeButton;
//  memo(PostLikeButton, isEqual);
