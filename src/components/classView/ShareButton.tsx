import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props extends TouchableWithoutFeedbackProps {
  parallaxHeaderVisible?: boolean;
  needMarginRight?: boolean;
  handleOnPressShare: () => void;
  appearance: AppearanceType;
}

const ShareButton = ({ needMarginRight, parallaxHeaderVisible, handleOnPressShare, appearance, ...rest }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const color = parallaxHeaderVisible ? theme.colors.background : theme.colors.placeholder;

  return (
    <TouchableOpacity
      onPress={handleOnPressShare}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      {...(needMarginRight && { style: styles.mediumMarginRight })}
    >
      <Icon name={'share-square-o'} size={theme.iconSize.big} color={color} />
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    mediumMarginRight: { marginRight: theme.size.medium },
  });

export default memo(ShareButton);
