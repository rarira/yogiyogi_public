import { NavigationParams, NavigationRoute, NavigationScreenProp, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AccountStatusType } from '../../API';
import DeleteBlockButton from './DeleteBlockButton';
import { MySnackbarAction } from '../MySnackbar';
import UserThumbnail from '../UserThumbnail';
import { getMyBlockedUser } from '../../customGraphqls';
import gql from 'graphql-tag';
import handleNavToUserProfile from '../../functions/handleNavToUserProfile';
import { useQuery } from '@apollo/react-hooks';
import reportSentry from '../../functions/reportSentry';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  userId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  myId: string;
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  updateQuery: any;
  appearance: AppearanceType;
}

const GET_MY_BLOCKED_USER = gql(getMyBlockedUser);

const MyBlockedUserCard = ({ userId, snackbarDispatch, myId, navigation, updateQuery, appearance }: Props) => {
  const { error, data } = useQuery(GET_MY_BLOCKED_USER, {
    variables: { id: userId },
    fetchPolicy: 'cache-first',
  });

  if (!data || !data.getUser) {
    return null;
    // return <Loading size={5} />;
  }

  if (error) {
    reportSentry(error);
    return null;
  }

  const { id, name, blockedBy, picture, accountStatus, oauthPicture, identityId } = data.getUser;

  const _handleOnPress = () =>
    navigation.navigate('UserProfile', {
      userId: id,
      userName: name,
      userIdentityId: identityId,
      origin: 'MyBlockedList',
    });

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  if (accountStatus === AccountStatusType.disabled) {
    return <Text style={styles.disabledUser}>탈퇴한 사용자입니다</Text>;
  }

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity onPress={_handleOnPress}>
        <View style={styles.infoRow}>
          <View style={styles.thumbnailContainer}>
            <UserThumbnail
              source={picture || oauthPicture}
              size={32}
              // userName={name}
              identityId={identityId}
              noBackground
              noBadge
              onPress={handleNavToUserProfile(navigation, 'MyBlockedList', id, identityId, name)}
            />
          </View>

          <Text style={styles.cardTitleText} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
        </View>
      </TouchableOpacity>
      <DeleteBlockButton
        myId={myId}
        userId={userId}
        snackbarDispatch={snackbarDispatch}
        blockedBy={blockedBy}
        updateQuery={updateQuery}
      />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    cardWrapper: {
      // flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: theme.size.small,
      borderColor: theme.colors.borderColor,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 10,
      borderRadius: 8,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    thumbnailContainer: { marginRight: theme.size.small },
    cardTitleText: {
      // flex: 1,
      color: theme.colors.text,
      fontSize: theme.fontSize.normal,
    },
    disabledUser: { color: theme.colors.disabled, fontSize: theme.size.small, alignSelf: 'flex-start' },
  });

export default memo(withNavigation(MyBlockedUserCard));
