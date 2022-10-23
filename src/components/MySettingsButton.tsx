import React, { memo } from 'react';
import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import theme from '../configs/theme';

interface Props extends TouchableWithoutFeedbackProps {
  onPress: () => void;
}
const MySettingsButton = ({ onPress, ...rest }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }} {...rest}>
      <Icon name="setting" size={theme.iconSize.big} color={theme.colors.placeholder} />
    </TouchableOpacity>
  );
};

export default memo(MySettingsButton);
