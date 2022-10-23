import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import Icon from 'react-native-vector-icons/FontAwesome';
import { useStoreState } from '../../stores/initStore';

interface Props extends TouchableWithoutFeedbackProps {
  needMarginRight?: boolean;
  handleOnPressShare: () => void;
}

const SharePostButton = ({ needMarginRight, handleOnPressShare, shareButtonEl, ...rest }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const color = getThemeColor('placeholder', appearance);

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

const styles = StyleSheet.create({
  mediumMarginRight: { marginRight: theme.size.medium },
});

export default memo(SharePostButton);
