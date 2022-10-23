import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GetUserQuery } from '../../API';
import Icon from 'react-native-vector-icons/AntDesign';
import UserThumbnail from '../UserThumbnail';
import getUserId from '../../functions/getUserId';
import { getTheme, getThemeColor } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';
import ThemedButton from '../ThemedButton';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  data: GetUserQuery['getUser'];
}

const MyProfile = ({ navigation, data }: Props) => {
  const {
    authStore: { identityId, profileUpdated, appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const { id, name, picture, oauthPicture } = data!;
  const idString = useMemo(() => getUserId(id), [id]);

  const _handleNaviToSettings = () => navigation.push('MySettings');
  const _handleNaviToMyProfile = useCallback(
    () => navigation.push('UpdateProfile', { origin: 'My', userId: id, identityId }),
    [id, identityId, navigation],
  );
  const _handleNaviToUserProfile = () =>
    navigation.navigate('UserProfile', { origin: 'My', userId: id, identityId, userName: name });

  return (
    <View style={styles.profileContainer}>
      <UserThumbnail
        source={picture || oauthPicture}
        onPress={_handleNaviToMyProfile}
        size={theme.iconSize.smallThumbnail}
        noBackground
        noBadge
        isMyself
      />
      <View style={styles.body}>
        <View style={styles.infoRow}>
          <Text style={styles.userId}>
            {name || 'anonymous'}({idString})
          </Text>
          <TouchableOpacity
            onPress={_handleNaviToUserProfile}
            style={styles.goToProfileTO}
            hitSlop={{ top: 5, left: 5, right: 5, bottom: 5 }}
          >
            <Text style={styles.goToProfileText}>프로필 보기</Text>
            <Icon name="right" color={theme.colors.placeholder} size={theme.fontSize.medium} />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton
            compact
            mode="outlined"
            onPress={_handleNaviToMyProfile}
            style={styles.profileUpdateButton}
            color={profileUpdated ? theme.colors.primary : theme.colors.accent}
          >
            {!profileUpdated ? '프로필 업데이트 필요!' : '프로필 업데이트'}
          </ThemedButton>
          <ThemedButton compact mode="outlined" onPress={_handleNaviToSettings} style={styles.settingsButton}>
            <Icon name="setting" size={theme.fontSize.normal} color={theme.colors.primary} />
            <Text style={styles.text}>설정</Text>
          </ThemedButton>
        </View>
      </View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: theme.size.big,
      marginBottom: theme.size.medium,
    },
    body: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      marginLeft: theme.size.normal,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.size.small,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      // marginTop: theme.size.small,
    },
    userId: {
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      color: theme.colors.text,
    },
    goToProfileTO: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
    goToProfileText: {
      fontSize: theme.fontSize.small,
      color: theme.colors.placeholder,
      marginRight: theme.size.xs,
    },
    profileUpdateButton: {
      flex: 1,
      borderColor: theme.colors.placeholder,
      borderWidth: StyleSheet.hairlineWidth,
      marginRight: theme.size.normal,
    },
    settingsButton: {
      borderColor: theme.colors.placeholder,
      borderWidth: StyleSheet.hairlineWidth,
      justifyContent: 'center',
      alignItems: 'center',
    },
    introText: { fontSize: theme.fontSize.small, color: theme.colors.placeholder },
    text: { color: theme.colors.text },
  });

export default memo(withNavigation(MyProfile));
