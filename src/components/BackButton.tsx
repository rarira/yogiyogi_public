import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import theme, { getThemeColor } from '../configs/theme';

import Icon from 'react-native-vector-icons/Ionicons';
import throttle from 'lodash/throttle';
import { useStoreState } from '../stores/initStore';

interface Props extends TouchableWithoutFeedbackProps {
  onPress: () => void;
  text?: string;
  parallaxHeaderVisible?: boolean;
  needMarginRight?: boolean;
}

const BackButton = ({ onPress, text, parallaxHeaderVisible, needMarginRight, ...rest }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const color = parallaxHeaderVisible
    ? getThemeColor('background', appearance)
    : getThemeColor('placeholder', appearance);
  return (
    <TouchableOpacity
      onPress={throttle(onPress, 3000)}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      style={[styles.container, needMarginRight && styles.mediumMarginRight]}
      {...rest}
    >
      <Icon name="ios-arrow-back" size={theme.iconSize.big} color={color} />
      {text && <Text style={{ color, fontSize: theme.fontSize.medium, marginLeft: theme.size.small }}>{text}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  mediumMarginRight: { marginRight: theme.size.medium },
});

export default memo(BackButton);
