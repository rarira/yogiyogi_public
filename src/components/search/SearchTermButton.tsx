import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  onPress: () => void;
  onCancel: () => void;
  message: string;
  displayIcon: boolean;
  appearance: AppearanceType;
}
const SearchTermButton = ({ onCancel, onPress, message, displayIcon, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.tagText}>{message}</Text>
      {displayIcon && (
        <TouchableOpacity
          onPress={onCancel}
          hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
          style={styles.cancelButton}
        >
          <Icon name="cancel" color={theme.colors.accent} size={theme.fontSize.big} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.backdrop,
      borderRadius: 5,
      padding: theme.size.small,
      marginRight: theme.size.small,
      height: 34,
      alignItems: 'center',
      marginBottom: theme.size.small,
    },
    tagText: { color: theme.colors.primary, fontSize: theme.fontSize.normal, alignSelf: 'center' },
    cancelButton: { marginLeft: theme.size.xs, alignItems: 'center' },
  });

export default memo(SearchTermButton);
