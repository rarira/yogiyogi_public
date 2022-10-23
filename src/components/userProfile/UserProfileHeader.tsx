import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { memo } from 'react';

import BlockedKoreanParagraph from '../BlockedKoreanParagraph';
import { GetUserQuery } from '../../API';
import Icon from 'react-native-vector-icons/FontAwesome5';
import UserThumbnail from '../UserThumbnail';
import getUserId from '../../functions/getUserId';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  data: GetUserQuery['getUser'];
  isMyself: boolean;
  userIdentityId: string;
  fromChat: boolean;
  appearance: AppearanceType;
}

const UserProfileHeader = ({ isMyself, userIdentityId, data, fromChat, appearance }: Props) => {
  const { id, name, intro, picture, oauthPicture, resumeURL, instagramId, facebookId, settings } = data!;

  const _handleOpenUrl = (url: string) => () => Linking.openURL(url).catch(err => console.log(err));

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.profileContainer}>
      <UserThumbnail
        source={picture || oauthPicture}
        size={theme.iconSize.thumbnail}
        noBackground
        noBadge
        isMyself={isMyself}
        identityId={userIdentityId}
      />
      <View style={styles.body}>
        <View style={styles.infoRow}>
          <Text style={styles.userId}>
            {name || '닉네임 없음'}({getUserId(id)})
          </Text>
        </View>
        {intro && <BlockedKoreanParagraph text={intro} textStyle={styles.introText} />}
        {(resumeURL || instagramId || facebookId) && (
          <View style={styles.socialContainer}>
            {resumeURL && (settings.privacyResume || fromChat) && (
              <TouchableOpacity style={styles.socialButton} onPress={_handleOpenUrl(resumeURL)}>
                <Icon name="link" size={theme.fontSize.medium} color={theme.colors.primary} />
                <Text style={styles.resumeText}>이력서 보기</Text>
              </TouchableOpacity>
            )}
            {facebookId && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={_handleOpenUrl(`https://www.facebook.com/${facebookId}`)}
              >
                <Icon name="facebook-square" size={theme.fontSize.subheading} color="#4267B2" />
              </TouchableOpacity>
            )}
            {instagramId && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={_handleOpenUrl(`https://www.instagram.com/${instagramId}`)}
              >
                <Icon name="instagram" size={theme.fontSize.subheading} color="#C13584" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginHorizontal: theme.size.big,
      marginVertical: theme.size.medium,
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
      justifyContent: 'flex-start',
      marginBottom: theme.size.small,
    },
    userId: {
      fontSize: theme.fontSize.normal,
      fontWeight: '700',
      color: theme.colors.text,
    },

    introText: { fontSize: theme.fontSize.medium, color: theme.colors.placeholder },
    socialContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginTop: theme.size.small,
    },
    resumeText: { fontSize: theme.fontSize.medium, color: theme.colors.primary, marginLeft: theme.size.small },
    socialButton: { flexDirection: 'row', alignItems: 'center', marginRight: theme.size.medium },
  });

export default memo(UserProfileHeader);
