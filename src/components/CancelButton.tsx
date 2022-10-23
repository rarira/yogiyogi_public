import React, { memo } from 'react';
import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import theme, { getThemeColor } from '../configs/theme';

import Icon from 'react-native-vector-icons/Ionicons';
import { useStoreState } from '../stores/initStore';

interface Props extends TouchableWithoutFeedbackProps {
  onPress: () => void;
}
const CancelButton = ({ onPress, ...rest }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }} {...rest}>
      <Icon name="md-close" size={theme.iconSize.big} color={getThemeColor('placeholder', appearance)} />
    </TouchableOpacity>
  );
};

export default memo(CancelButton);
