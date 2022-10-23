import { AppearanceType, CommentData } from '../../types/store';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import KoreanParagraph from '../KoreanParagraph';
import { MySnackbarAction } from '../MySnackbar';
import PostCommentsByThread from './PostCommentsByThread';
import UserThumbnail from '../UserThumbnail';
import { WarningProps } from '../WarningDialog';
import getDimensions from '../../functions/getDimensions';
import getUsername from '../../functions/getUsername';
import handleNavToUserProfile from '../../functions/handleNavToUserProfile';
import { useStoreState } from '../../stores/initStore';

interface CommentCardSubProps extends NavigationInjectedProps {
  latestSubComment: CommentData | null;
  numOfSub: number;
  addedToId: string;
  origin: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setWarningProps?: (arg: Partial<WarningProps> | null) => void;
  postTitle: string;
  // keyboardHeight?: number;
  // originalId: string;
}

const { SCREEN_WIDTH } = getDimensions();

const CommentCardSub = ({
  latestSubComment,
  numOfSub,
  addedToId,
  origin,
  snackbarDispatch,
  setWarningProps,
  navigation,
  postTitle,
}: // keyboardHeight,
CommentCardSubProps) => {
  const [unfolded, setUnfolded] = useState(false);
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  if (numOfSub === 0) {
    return null;
  } else if (numOfSub === 1 || unfolded) {
    return (
      <View style={styles.container}>
        <PostCommentsByThread
          addedToId={addedToId}
          origin={origin}
          snackbarDispatch={snackbarDispatch}
          setWarningProps={setWarningProps}
          postTitle={postTitle}
        />
      </View>
    );
  }

  const {
    id,
    author: { id: authorId, name, picture, oauthPicture, identityId, blockedBy, blockedUser },
  } = latestSubComment!;
  const isMyself = !!user && user.username === authorId;
  const fromBlockedUser = !!user && !isMyself && !!blockedBy && blockedBy.includes(user.username);
  const isBlockedByAuthor = !!user && !isMyself && !!blockedUser && blockedUser.includes(user.username);
  const authorName = getUsername(authorId, name);

  const _handleUnfold = () => setUnfolded(true);

  return (
    <View style={styles.summaryContainer}>
      <TouchableOpacity onPress={_handleUnfold} style={styles.button}>
        <Text style={styles.buttonText}>... 답글 펼쳐 보기 ...</Text>
      </TouchableOpacity>
      <View style={styles.numberRow}>
        <TouchableOpacity
          onPress={handleNavToUserProfile(navigation, origin, authorId, identityId, name)}
          disabled={isMyself || fromBlockedUser || isBlockedByAuthor || !user}
        >
          <UserThumbnail
            source={fromBlockedUser || isBlockedByAuthor ? null : picture || oauthPicture}
            size={theme.iconSize.small}
            isMyself={isMyself}
            noBadge
            identityId={identityId ?? undefined}
            noBackground
          />
        </TouchableOpacity>
        <KoreanParagraph
          text={`${authorName} 님의 마지막 답글을 포함 ${numOfSub}개의 답글이 있습니다.`}
          textStyle={styles.numberText}
          paragraphStyle={styles.paragraph}
        />
      </View>
    </View>
  );
};

export default memo(withNavigation(CommentCardSub));

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      width: SCREEN_WIDTH - 2 * (theme.size.big + theme.size.medium),
      marginTop: 2 * theme.size.normal,
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    summaryContainer: {
      width: SCREEN_WIDTH - 2 * (theme.size.big + theme.size.medium),
      marginVertical: theme.size.normal,
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    numberRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      paddingRight: theme.size.medium,
    },
    numberText: {
      fontSize: theme.fontSize.small,
      color: getThemeColor('placeholder', appearance),
    },
    button: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: theme.size.small,
      marginBottom: theme.size.big,
    },
    buttonText: { fontSize: theme.fontSize.medium, color: getThemeColor('primary', appearance), fontWeight: '600' },
    paragraph: { marginLeft: theme.size.small },
  });
