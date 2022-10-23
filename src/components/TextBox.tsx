import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getTheme } from '../configs/theme';
import { AppearanceType } from '../types/store';

interface Props {
  color: string;
  fontWeight: string;
  text: string;
  subText?: string;
  appearance: AppearanceType;
}

const TextBox = ({ color, fontWeight, text, subText, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  return (
    <View style={[styles.container, !!subText && styles.columnContainer, { borderColor: color }]}>
      <Text style={{ color: color, fontWeight: fontWeight, fontSize: theme.fontSize.medium }}>{text}</Text>
      {subText && <Text style={styles.subText}>{subText}</Text>}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: theme.size.small,
      paddingVertical: theme.size.small,
      paddingHorizontal: theme.size.small,
      borderWidth: 1,
    },
    columnContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      borderWidth: StyleSheet.hairlineWidth,
    },
    subText: {
      fontSize: theme.fontSize.small,
      color: theme.colors.backdrop,
    },
  });

export default memo(TextBox);
