import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { Ref } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { CommentData } from '../../types/store';
import { CommentDepth } from '../../API';
import { PREPARE_REPLY_TO_COMMENT } from '../../stores/actionTypes';
import getUsername from '../../functions/getUsername';

interface Props extends NavigationInjectedProps {
  commentItem: CommentData;
  textInputEl?: Ref<TextInput>;
  postTitle: string;
}

const ReplyToButton = ({ commentItem, navigation, textInputEl, postTitle }: Props) => {
  const {
    authStore: { appearance },
    commentStore: { replyToComment },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const {
    commentDepth,
    id,
    originalId,
    addedToId,
    author: { id: authorId, name },
  } = commentItem;

  const { routeName } = navigation.state;
  const isMain = commentDepth === CommentDepth.MAIN;
  const commentViewAddedToId = isMain ? id : addedToId;
  const receiverName = getUsername(authorId, name);
  const onReplyTo = !!replyToComment && replyToComment.id === id;

  const _handleOnPress = () => {
    const actionObj = {
      type: PREPARE_REPLY_TO_COMMENT,
      replyToComment: commentItem,
      postId: originalId,
      commentViewAddedToId,
      commentViewAuthorId: authorId,
      postTitle,
      // receiverId: authorId,
      receiverName,
    };
    if (routeName === 'CommentView') {
      storeDispatch(actionObj);
      if (!!textInputEl) {
        textInputEl.current!.focus();
      }
    } else {
      storeDispatch(actionObj);
      navigation.push('CommentView', {
        origin: routeName,
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={_handleOnPress} disabled={onReplyTo}>
      <Text
        style={[
          styles.buttonText,
          { color: onReplyTo ? getThemeColor('accent', appearance) : getThemeColor('placeholder', appearance) },
        ]}
      >
        {onReplyTo ? '답글 다는 중' : '답글 달기'}
      </Text>
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

export default withNavigation(ReplyToButton);
