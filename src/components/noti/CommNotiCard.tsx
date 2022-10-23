import { CommentDepth, CommentNotiStatus } from '../../API';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { customListCommentsByReceiver, deleteCommentNoti } from '../../customGraphqls';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { CommentData } from '../../types/store';
import { DataProxy } from 'apollo-cache';
import DeleteButton from '../DeleteButton';
import KoreanParagraph from '../KoreanParagraph';
import { SET_COMMENT_STATE } from '../../stores/actionTypes';
import TimeDistance from '../TimeDistance';
import getUsername from '../../functions/getUsername';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import { getTheme } from '../../configs/theme';
import throttle from 'lodash/throttle';
import { useMutation } from '@apollo/react-hooks';

interface Props extends NavigationInjectedProps {
  noti: CommentData;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  queryInput: any;
}

const DELETE_NOTI = gql(deleteCommentNoti);
const LIST_COMMENTS_BY_RECEIVER = gql(customListCommentsByReceiver);

const CommNotiCard = ({ noti, navigation, snackbarDispatch, queryInput }: Props) => {
  const {
    authStore: {
      user: { username },
      appearance,
    },
    // commentStore: { postId, postAuthorId },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const {
    id,
    addedToId,
    originalId,
    createdAt,
    commentDepth,
    // commentStatus,
    commentContent,
    // blockedBy,
    author,
    replyInfo,
  } = noti;

  const _handleOnPress = () => {
    if (commentDepth === CommentDepth.MAIN) {
      storeDispatch({
        type: SET_COMMENT_STATE,
        postId: originalId,
        postAuthorId: username,
        postTitle: replyInfo.repliedPostTitle,
        notiCommentId: id,
      });
      navigation.navigate('PostCommentView', {
        // backToPostId: originalId,
        origin: 'Noti',
      });
    } else {
      storeDispatch({
        type: SET_COMMENT_STATE,
        postId: originalId,
        replyToComment: noti,
        commentViewAddedToId: addedToId,
        // commentViewAuthorId:
        // postAuthorId: username,
        postTitle: replyInfo.repliedPostTitle,
        // notiCommentId: id,
      });
      navigation.navigate('CommentView', {
        origin: 'Noti',
      });
    }
  };

  const authorName = getUsername(author.id, author.name);

  const _getNotiText = () => {
    switch (commentDepth) {
      case CommentDepth.MAIN:
        //TODO: prod 에서는 그냥 replyInfo?.repliedPostTitle 로 지정
        return `당신의 게시물 "${replyInfo?.repliedPostTitle ??
          '게시물 제목'}" 에 "${authorName}" 님이 다음과 같은 댓글을 달았습니다 :`;
      case CommentDepth.SUB:
        return `게시물 "${replyInfo?.repliedPostTitle ??
          '게시물 제목'}" 에 달았던 댓글에 "${authorName}" 님이 다음과 같은 답글을 달았습니다 : `;
      default:
        return '내용 미상';
    }
  };

  const renderClearButton = () => {
    const [deleteNoti, { loading }] = useMutation(DELETE_NOTI);
    const _handleClear = async () => {
      try {
        await deleteNoti({
          variables: { input: { id, commentNotiStatus: CommentNotiStatus.DELETED, createdAt } },
          // refetchQueries: [{ query: LIST_NOTIS_BY_RECEIVER, variables: queryInput }],
          update: (store: DataProxy, { data: { updateComment } }) => {
            // console.log(updateComment);
            try {
              const queryResult: any = store.readQuery({ query: LIST_COMMENTS_BY_RECEIVER, variables: queryInput });

              const { items, ...others } = queryResult.listCommentsByReceiver;
              const newItems = items.filter((item: CommentData) => {
                return item.id !== updateComment.id;
              });

              const newData = { listCommentsByReceiver: { items: newItems, ...others } };

              store.writeQuery({ query: LIST_COMMENTS_BY_RECEIVER, variables: queryInput, data: newData });
            } catch (err) {
              console.log(err);
            }
          },
        });
      } catch (e) {
        reportSentry(e);
        snackbarDispatch({ type: OPEN_SNACKBAR, message: '알림 삭제 실패, 잠시 후 다시 시도하세요' });
      }
    };

    return <DeleteButton handleOnPress={throttle(_handleClear, 5000)} loading={loading} appearance={appearance} />;
  };

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity onPress={_handleOnPress} style={styles.cardBody}>
        <KoreanParagraph
          text={_getNotiText()}
          textStyle={styles.notiTitleText}
          focusTextStyle={styles.notiTitleClassText}
        />
        <KoreanParagraph
          text={commentContent.slice(0, 20)}
          textStyle={styles.notiDescText}
          paragraphStyle={styles.notiDescParagraph}
        />
        <TimeDistance time={createdAt} />
      </TouchableOpacity>

      <View style={styles.chatIcon}>{renderClearButton()}</View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    cardWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingVertical: theme.size.small,
      paddingLeft: theme.size.small,
      marginBottom: theme.size.small,
    },

    cardBody: {
      flex: 3,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginHorizontal: theme.size.xs,
    },

    notiTitleText: {
      color: theme.colors.placeholder,
      fontSize: theme.fontSize.medium,
    },
    notiDescText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.small,
    },
    notiDescParagraph: {
      backgroundColor: theme.colors.grey200,
      paddingHorizontal: theme.size.small,
      paddingVertical: theme.size.small,
      marginVertical: theme.size.small,
      borderRadius: theme.size.small,
    },
    notiTitleClassText: {
      color: theme.colors.focus,
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
    },
    alignSelfCenter: {
      alignSelf: 'center',
    },

    chatIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
    },
  });

export default memo(withNavigation(CommNotiCard));
