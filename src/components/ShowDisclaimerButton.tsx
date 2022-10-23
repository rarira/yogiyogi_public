import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import theme, { getThemeColor } from '../configs/theme';
import throttle from 'lodash/throttle';
import { AppearanceType } from '../types/store';

interface Props {
  iconName?: string;
  needMarginRight?: boolean;
  color?: string;
  onPress: () => void;
  appearance: AppearanceType;
}

const ShowDisclaimerButton = ({ iconName, needMarginRight, onPress, color, appearance }: Props) => {
  const iconColor = color || getThemeColor('placeholder', appearance);
  return (
    <TouchableOpacity
      onPress={throttle(onPress, 200)}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...(needMarginRight && { style: styles.mediumMarginRight })}
    >
      <Icon name={iconName || 'warning'} size={theme.iconSize.big} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mediumMarginRight: { marginRight: theme.size.medium },
});

export default memo(ShowDisclaimerButton);
