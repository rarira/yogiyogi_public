import { StyleSheet, Text, View } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import React from 'react';
import { getTheme } from '../configs/theme';
import { AppearanceType } from '../types/store';

interface Props {
  numOfLikes: number;
  appearance: AppearanceType;
}

const LikeCounter = ({ numOfLikes, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  return (
    <View style={styles.container}>
      <Icon name="thumbs-up" size={theme.fontSize.small} color={theme.colors.iosBlue} />
      <Text style={styles.textStyle}>{numOfLikes}</Text>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      height: theme.fontSize.normal,
      paddingHorizontal: theme.size.small,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.fontSize.normal / 2,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.15,
    },
    textStyle: {
      fontSize: theme.fontSize.small,
      marginLeft: theme.size.xs,
      color: theme.colors.placeholder,
    },
  });

export default LikeCounter;
