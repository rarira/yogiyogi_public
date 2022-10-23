import { StyleSheet, View } from 'react-native';

import React from 'react';
import { getTheme } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface NotiTabBarBadgeProps {
  route: {
    key: string;
    title?: string;
  };
}

const NotiTabBarBadge = ({ route }: NotiTabBarBadgeProps) => {
  const {
    authStore: { newGenNotisAvailable, newClassNotisAvailable, newCommNotisAvailable, appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  // let newGenNotisAvailable = true;
  // let newClassNotisAvailable = true;
  // let newCommNotisAvailable = true;

  const isAvailable: boolean =
    (route.key === 'genNotis' && newGenNotisAvailable) ||
    (route.key === 'keywordNotis' && newClassNotisAvailable) ||
    (route.key === 'commNotis' && newCommNotisAvailable);

  // console.log(route.key, newGenNotisAvailable, newClassNotisAvailable, newCommNotisAvailable, isAvailable);
  if (isAvailable) return <View style={styles.badge} />;
  return null;
};

export default NotiTabBarBadge;

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    badge: {
      position: 'absolute',
      top: 8,
      left: -8,
      backgroundColor: theme.colors.accent,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });
