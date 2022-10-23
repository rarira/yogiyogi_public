import { Avatar, Badge } from 'react-native-paper';
import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ClassViewCardInfoText from './classView/ClassViewCardInfoText';
import FastImage from 'react-native-fast-image';
import { S3Object } from '../types/apiResults';
import getUserProfilePicture from '../functions/getUserProfilePicture';
import isEqual from 'react-fast-compare';
import reportSentry from '../functions/reportSentry';
import { getTheme } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

interface Props {
  source: string | S3Object | null;
  onPress?: () => void;
  userName?: string;
  userType?: string;
  totalRating?: number;
  size: number;
  noBackground?: boolean;
  noBadge?: boolean;
  isMyself?: boolean;
  identityId?: string;
  blackText?: boolean;
}
const UserThumbnail = ({
  source,
  identityId,
  onPress,
  userName,
  userType,
  size,
  totalRating,
  noBackground,
  noBadge,
  isMyself,
  blackText,
}: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const [thumbnailSource, setThumbnailSource] = useState<string | null>(null);

  // console.log(userName, source);
  useEffect(() => {
    let focused = true;
    const getProfile = async (source: S3Object) => {
      try {
        const result = await getUserProfilePicture(isMyself, source.key, identityId);
        // console.log('ut url:', result);
        if (focused) {
          setThumbnailSource(result.toString());
        }
      } catch (e) {
        reportSentry(e);
      }
    };
    if (!thumbnailSource) {
      if (source === null) {
        setThumbnailSource(null);
      } else if (typeof source === 'string') {
        setThumbnailSource(source);
      } else {
        getProfile(source);
      }
    }
    return () => {
      focused = false;
    };
  }, [source]);

  const backgroundSize = noBackground ? size : size * 1.2;
  const badgeSize = size === theme.iconSize.thumbnail ? theme.size.big : theme.size.medium;

  const innerContent = () => (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 5,
      }}
    >
      {thumbnailSource ? (
        <FastImage
          source={{ uri: thumbnailSource, priority: FastImage.priority.high }}
          style={{ width: size, height: size, borderRadius: size / 5 }}
        />
      ) : (
        <Avatar.Icon size={size} icon="person" color="white" style={[styles.avatarIcon, { borderRadius: size / 5 }]} />
      )}
    </View>
  );

  return (
    <TouchableOpacity disabled={!onPress} style={styles.touchableContainer} onPress={onPress}>
      <View
        style={[
          styles.thumbnailContainer,
          {
            width: backgroundSize,
            height: backgroundSize,
            borderRadius: backgroundSize / 5,
            backgroundColor: noBackground ? 'transparent' : 'rgba(0, 0, 0, 0.65)',
          },
          { ...(userName && { marginBottom: theme.size.xs }) },
        ]}
      >
        {innerContent()}
      </View>

      {!noBadge && (
        <Badge style={[styles.badge, { left: backgroundSize * 0.8 }]} size={badgeSize}>
          <Text style={styles.badgeRatingText}>{totalRating}</Text>
        </Badge>
      )}
      {userName && (
        <ClassViewCardInfoText category={userType} value={userName} blackText={blackText} appearance={appearance} />
      )}
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    touchableContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnailContainer: {
      // flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },

    badge: { position: 'absolute', top: -5 },
    badgeRatingText: { fontWeight: '500', color: theme.colors.text },
    avatarIcon: { backgroundColor: theme.colors.disabled },
  });

export default memo(UserThumbnail, isEqual);
