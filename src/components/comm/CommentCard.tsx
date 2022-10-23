import { AppearanceType, CommentData } from '../../types/store';
import { CommentDepth, CommentStatus } from '../../API';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { Ref, memo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import theme, { getThemeColor, normalize } from '../../configs/theme';

import BasicParsedText from '../BasicParsedText';
import BlockedComment from '../BlockedComment';
import CommentBlockButton from './CommentBlockButton';
import CommentCardSub from './CommentCardSub';
import CommentDeleteButton from './CommentDeleteButton';
import CommentEditButton from './CommentEditButton';
import CommentLikeButton from './CommentLikeButton';
import LikeCounter from '../LikeCounter';
import { MySnackbarAction } from '../MySnackbar';
import ReplyToButton from './ReplyToButton';
import TimeDistance from '../TimeDistance';
import UserThumbnail from '../UserThumbnail';
import { WarningProps } from '../WarningDialog';
import getDimensions from '../../functions/getDimensions';
import getUsername from '../../functions/getUsername';
import handleNavToUserProfile from '../../functions/handleNavToUserProfile';
import isEqual from 'react-fast-compare';
import { useStoreState } from '../../stores/initStore';

const { SCREEN_WIDTH } = getDimensions();
interface Props extends NavigationInjectedProps {
  commentItem: CommentData;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setWarningProps?: (arg: Partial<WarningProps> | null) => void;
  textInputEl?: Ref<TextInput>;
  // keyboardHeight?: number;
  postTitle: string;
}

const CommentCard = ({ commentItem, snackbarDispatch, setWarningProps, textInputEl, postTitle, navigation }: Props) => {
  const {
    authStore: { user, appearance },
    commentStore: { editComment, replyToComment, notiCommentId },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  const {
    id,
    createdAt,
    commentDepth,
    commentStatus,
    commentContent,
    numOfSub,
    numOfLikes,
    likedUsers,
    blockedBy,
    latestSubComment,
    author,
    receiver,
    originalId,
  } = commentItem;

  const isMyself = !!user && user.username === author.id;
  const isDeleted = commentStatus === CommentStatus.DELETED;

  const isBlocked = !!user && !isMyself && !!blockedBy && blockedBy.includes(user.username);
  const fromBlockedUser = !!user && !isMyself && !!author.blockedBy && author.blockedBy.includes(user.username);
  const isBlockedByAuthor = !!user && !isMyself && !!author.blockedUser && author.blockedUser.includes(user.username);
  const authorName = getUsername(author.id, author.name);
  const receiverName = getUsername(receiver.id, receiver.name);
  const onEdit = !!editComment && editComment.id === id;
  const onReplyTo = !!replyToComment && replyToComment.id === id;
  const fromNoti = !!notiCommentId && notiCommentId === id;
  const { routeName } = navigation.state;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleNavToUserProfile(navigation, routeName, author.id, author.identityId, author.name)}
        disabled={isMyself || fromBlockedUser || isBlockedByAuthor || !user}
      >
        <UserThumbnail
          source={fromBlockedUser || isBlockedByAuthor || isDeleted ? null : author.picture || author.oauthPicture}
          size={theme.iconSize.small}
          isMyself={isMyself}
          noBadge
          identityId={author.identityId ?? undefined}
          noBackground
        />
      </TouchableOpacity>

      <View style={styles.contentsContainer}>
        {isBlockedByAuthor || fromBlockedUser ? (
          <BlockedComment isBlockedByYou={fromBlockedUser} appearance={appearance} />
        ) : (
          <>
            <View
              style={[
                styles.bubbleBox,
                isMyself && { backgroundColor: getThemeColor('blue50', appearance) },
                fromNoti && {
                  backgroundColor: getThemeColor('background', appearance),
                  borderColor: getThemeColor('accent', appearance),
                  borderWidth: 2,
                  padding: theme.size.normal - 2,
                },
                (onEdit || onReplyTo) && {
                  borderColor: getThemeColor('iosBlue', appearance),
                  borderWidth: 2,
                  padding: theme.size.normal - 2,
                },
              ]}
            >
              <View style={styles.authorControlRow}>
                {!isDeleted && <Text style={styles.authorText}>{authorName}</Text>}
                {!isDeleted && isMyself && (
                  <View style={styles.authorControlBox}>
                    <CommentEditButton commentItem={commentItem} textInputEl={textInputEl} postTitle={postTitle} />
                    <CommentDeleteButton
                      commentId={id}
                      createdAt={createdAt}
                      postId={originalId}
                      snackbarDispatch={snackbarDispatch}
                      setWarningProps={setWarningProps}
                    />
                  </View>
                )}
              </View>
              {isBlocked || isDeleted ? (
                <Text style={styles.blockedText}>
                  {isBlocked ? '차단한' : isMyself ? '당신이 삭제한' : '작성자에 의해 삭제된'} 댓글
                </Text>
              ) : (
                <View>
                  {commentDepth === CommentDepth.SUB && <Text style={styles.receiverNameText}>@{receiverName}</Text>}
                  <BasicParsedText text={commentContent} textStyle={styles.contentText} />
                </View>
              )}
              {!isDeleted && (
                <View style={styles.likeCounter}>
                  <LikeCounter numOfLikes={numOfLikes ?? 0} appearance={appearance} />
                </View>
              )}
            </View>
            <View style={styles.controlRow}>
              <TimeDistance time={createdAt} />
              {!isBlocked && (
                <>
                  {!!user && !isMyself && (
                    <ReplyToButton commentItem={commentItem} textInputEl={textInputEl!} postTitle={postTitle} />
                  )}

                  {!!user && !isMyself && !isDeleted && (
                    <View style={styles.userControlBox}>
                      <CommentLikeButton commentId={id} likedUsers={likedUsers} snackbarDispatch={snackbarDispatch} />
                      <CommentBlockButton
                        commentId={id}
                        snackbarDispatch={snackbarDispatch}
                        setWarningProps={setWarningProps}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
            {routeName !== 'CommentView' && commentDepth === CommentDepth.MAIN && (
              <CommentCardSub
                latestSubComment={latestSubComment}
                numOfSub={numOfSub}
                addedToId={id}
                postTitle={postTitle}
                origin={routeName}
                snackbarDispatch={snackbarDispatch}
                setWarningProps={setWarningProps}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    contentsContainer: {
      marginHorizontal: theme.size.small,
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    bubbleBox: {
      backgroundColor: getThemeColor('grey200', appearance),
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: theme.size.normal,
      minWidth: Math.max(normalize(100), SCREEN_WIDTH / 2.5),
      // paddingTop: theme.size.medium,
      // marginRight: theme.size.big,
      borderRadius: theme.size.small,
    },
    controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.size.normal,
      marginTop: theme.size.small,
    },
    authorText: {
      fontSize: theme.fontSize.medium,
      color: getThemeColor('text', appearance),
      fontWeight: '500',
    },
    authorControlRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.size.small,
    },
    contentText: {
      fontSize: theme.fontSize.medium,
      color: getThemeColor('placeholder', appearance),
    },
    authorControlBox: {
      marginLeft: theme.size.normal,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    userControlBox: {
      marginLeft: theme.size.normal,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    likeCounter: {
      position: 'absolute',
      top: -theme.size.normal,
      right: theme.size.normal,
    },
    blockedText: {
      fontSize: theme.fontSize.medium,
      color: getThemeColor('error', appearance),
      alignSelf: 'center',
    },
    receiverNameText: {
      fontSize: theme.fontSize.medium,
      color: getThemeColor('text', appearance),
      marginBottom: theme.size.xs,
    },
  });

export default memo(withNavigation(CommentCard), isEqual);
