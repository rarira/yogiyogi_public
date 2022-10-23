import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { Ref } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { CommentData } from '../../types/store';
import { CommentDepth } from '../../API';
import { PREPARE_UPDATE_COMMENT } from '../../stores/actionTypes';
import getUsername from '../../functions/getUsername';

interface Props extends NavigationInjectedProps {
  commentItem: CommentData;

  textInputEl?: Ref<TextInput>;
  postTitle: string;
}

const CommentEditButton = ({ commentItem, textInputEl, postTitle, navigation }: Props) => {
  const {
    authStore: { appearance },
    commentStore,
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const { editComment } = commentStore;
  const isMain = commentItem.commentDepth === CommentDepth.MAIN;
  const onEdit = !!editComment && editComment.id === commentItem.id;

  const _handleOnPress = () => {
    const updateObj = {
      type: PREPARE_UPDATE_COMMENT,
      postId: commentItem.originalId,
      editComment: commentItem,
      content: commentItem.commentContent,
      commentViewAddedToId: isMain ? commentItem.id : commentItem.addedToId,
      postTitle,
      // receiverId: commentItem.receiver.id,
      receiverName: getUsername(commentItem.receiver.id, commentItem.receiver.name),
    };
    const { routeName } = navigation.state;
    // console.log(routeName);
    if (routeName === 'PostCommentView' || routeName === 'CommentView') {
      storeDispatch(updateObj);
      if (!!textInputEl) {
        textInputEl.current!.focus();
      }
    } else {
      if (isMain) {
        storeDispatch(updateObj);
        navigation.push('PostCommentView', { origin: routeName });
      } else {
        storeDispatch(updateObj);
        navigation.push('CommentView', { origin: routeName });
      }
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={_handleOnPress} disabled={onEdit}>
      <Text
        style={[styles.buttonText, onEdit ? { color: getThemeColor('accent', appearance) } : { color: getThemeColor('placeholder', appearance) }]}
      >
        {onEdit ? '수정 중' : '수정'}
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
    // color: theme.colors.placeholder,
    fontWeight: '600',
  },
});

export default withNavigation(CommentEditButton);
