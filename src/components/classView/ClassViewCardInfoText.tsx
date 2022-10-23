import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  value: string;
  blackText?: boolean;
  category?: string;
  appearance: AppearanceType;
}

const ClassViewCardInfoText = ({ category, blackText, value, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  return (
    <View style={styles.container}>
      {category && (
        <Text style={[styles.keyText, { color: blackText ? theme.colors.text : theme.colors.background }]}>
          {category}{' '}
        </Text>
      )}
      <Text
        style={[styles.valueText, { color: blackText ? theme.colors.text : theme.colors.background }]}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.size.small,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyText: { fontWeight: '500', fontSize: theme.fontSize.medium },
    valueText: { fontWeight: '800', fontSize: theme.fontSize.normal },
  });
export default memo(ClassViewCardInfoText);
