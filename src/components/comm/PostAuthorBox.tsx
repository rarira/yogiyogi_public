import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import { UserData } from '../../types/apiResults';
import UserProfileButton from '../UserProfileButton';
import UserRatingBox from '../UserRatingBox';
import UserThumbnail from '../UserThumbnail';
import isEqual from 'react-fast-compare';
import { useStoreState } from '../../stores/initStore';

interface Props {
  userData: UserData;
  origin: string;
}

const PostAuthorBox = ({ userData, origin }: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const { id, identityId, name, oauthPicture, picture, ratings } = userData;
  const isMyself = !!user && id === user.username;

  const ThumbnailComponent = useCallback(
    () => (
      <UserThumbnail
        source={picture || oauthPicture || null}
        size={theme.iconSize.big}
        isMyself={isMyself}
        identityId={identityId ?? undefined}
        noBackground
        noBadge
      />
    ),
    [picture, oauthPicture, isMyself],
  );

  return (
    <View style={styles.container}>
      <UserProfileButton
        disabled={isMyself || !user}
        targetId={id}
        targetIdentityId={identityId}
        targetName={name}
        origin={origin}
        ThumbnailComponent={ThumbnailComponent}
        textStyle={[styles.profileText, { color: getThemeColor('text', appearance) }]}
      />
      <UserRatingBox ratings={ratings} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.size.big,
    paddingVertical: theme.size.normal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderColor: 'red',
    // borderColor: theme.colors.backdrop,
    // borderBottomWidth: StyleSheet.hairlineWidth,
  },

  profileText: { fontWeight: '600' },
});

export default memo(PostAuthorBox, isEqual);
