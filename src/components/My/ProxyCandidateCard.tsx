import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AccountStatusType } from '../../API';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { UserData } from '../../types/apiResults';
import UserThumbnail from '../UserThumbnail';
import handleNavToUserProfile from '../../functions/handleNavToUserProfile';
import theme, { getThemeColor } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  candidate: Partial<UserData>;
  classId: string;
  origin: string;
}

const ProxyCandidateCard = ({ candidate, navigation, classId, origin }: Props) => {
  const {
    authStore: {
      user: { username },
      appearance,
    },
  } = useStoreState();
  const { picture, oauthPicture, name, id, identityId, accountStatus, blockedBy, blockedUser } = candidate;
  const _handleOnPress = () => {
    navigation.navigate('ProxyReview', { origin, classId, proxyId: id, proxyName: name });
  };

  if (
    accountStatus === AccountStatusType.disabled ||
    (blockedBy && blockedBy.includes(username)) ||
    (blockedUser && blockedUser.includes(username))
  ) {
    return null;
  }

  const styles = getThemedStyles(appearance);
  return (
    <View style={styles.cardWrapper}>
      <View>
        <UserThumbnail
          source={picture || oauthPicture || null}
          identityId={identityId!}
          size={theme.iconSize.xl}
          noBackground
          noBadge
          onPress={handleNavToUserProfile(navigation, 'AllChatList', id!, identityId!, name!)}
        />
      </View>

      <TouchableOpacity onPress={_handleOnPress} style={styles.cardBody}>
        <Text style={styles.text}>{name}</Text>

        <Icon name="keyboard-arrow-right" size={theme.fontSize.heading} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    cardWrapper: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: getThemeColor('background', appearance),
      marginVertical: theme.size.small,
    },

    cardBody: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: theme.size.small,
      alignItems: 'center',
    },

    text: { color: getThemeColor('text', appearance) },
  });

export default memo(withNavigation(ProxyCandidateCard));
