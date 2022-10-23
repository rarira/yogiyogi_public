import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme, { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import { useStoreState } from '../stores/initStore';

interface Props {
  error: string;
  textLength?: number;
  maxLength?: number;
}

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.size.small,
      // borderColor: 'blue',
      // borderWidth: 1,
    },
    errorText: {
      fontSize: theme.fontSize.error,
      color: getThemeColor('error', appearance),
    },
    lengthText: {
      fontSize: theme.fontSize.error,
      color: getThemeColor('backdrop', appearance),
    },
  });

const TextInputHelperText = ({ error, textLength, maxLength }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{error}</Text>
      {maxLength && (
        <Text style={styles.lengthText}>
          {textLength} / {maxLength}
        </Text>
      )}
    </View>
  );
};

export default memo(TextInputHelperText);
