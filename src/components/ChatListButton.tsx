import React, { memo } from 'react';
import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

interface Props extends TouchableWithoutFeedbackProps {
  onPress: () => void;
  appearance: AppearanceType;
}
const ChatListButton = ({ onPress, appearance, ...rest }: Props) => {
  const iconColor = getThemeColor('placeholder', appearance);
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }} {...rest}>
      <Icon name="message1" size={theme.iconSize.big} color={iconColor} />
    </TouchableOpacity>
  );
};

export default memo(ChatListButton);
