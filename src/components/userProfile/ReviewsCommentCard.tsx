import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BlockedKoreanParagraph from '../BlockedKoreanParagraph';
import { ReviewData } from '../../types/apiResults';
import { SatisfactionType } from '../../API';
import TimeDistance from '../TimeDistance';
import UserThumbnail from '../UserThumbnail';
import handleNavToUserProfile from '../../functions/handleNavToUserProfile';
import theme, { getTheme } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationInjectedProps {
  item: ReviewData;
  userId: string;
  privacySetting: boolean;
  userName: string;
}

const ReviewsCommentCard = ({ item, userId, navigation, privacySetting, userName }: Props) => {
  const {
    authStore: {
      user: { username },
      appearance,
    },
  } = useStoreState();
  const {
    satisfaction,
    reviewer: { id, picture, oauthPicture, identityId, name },
    createdAt,
    content,
  } = item;

  const satisfied = satisfaction === SatisfactionType.good;
  const isMyself = userId === username;

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.cardInfoRow}>
        <UserThumbnail
          source={picture || oauthPicture || null}
          size={theme.iconSize.big}
          noBackground
          noBadge
          identityId={identityId!}
          onPress={handleNavToUserProfile(navigation, 'ReviewsList', id, identityId!, name)}
        />

        <TouchableOpacity onPress={handleNavToUserProfile(navigation, 'ReviewsList', id, identityId!, name)}>
          <Text style={styles.cardInfoText}>{name || '닉네임 없음'}</Text>
        </TouchableOpacity>
        <Text style={[styles.cardInfoText, { color: satisfied ? theme.colors.primary : theme.colors.error }]}>
          {satisfied ? '"만족했어요"' : '"아쉽습니다"'}
        </Text>
      </View>
      {!satisfied && !privacySetting && !isMyself ? (
        <Text style={styles.disabledText}>{userName} 님이 구체적인 내용 공개를 거부했습니다</Text>
      ) : (
        <BlockedKoreanParagraph text={content} />
      )}

      <View style={styles.marginTopSmall}>
        <TimeDistance time={createdAt} />
      </View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      marginHorizontal: theme.size.big,
    },
    cardInfoRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: theme.size.small,
    },
    cardInfoText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      marginLeft: theme.size.small,
    },
    disabledText: {
      color: theme.colors.backdrop,
    },
    marginTopSmall: {
      marginTop: theme.size.small,
    },
  });

export default memo(withNavigation(ReviewsCommentCard));
