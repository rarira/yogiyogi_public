import React, { memo } from 'react';
import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import Loading from './Loading';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

interface Props extends TouchableWithoutFeedbackProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  appearance: AppearanceType;
}
const SaveButton = ({ onPress, disabled, loading, appearance, ...rest }: Props) => {
  if (loading) return <Loading size="small" style={{ flex: 0 }} origin="SaveButton" auth />;

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      disabled={disabled}
      {...rest}
    >
      <Icon
        name="ios-send"
        size={theme.iconSize.big}
        color={disabled ? getThemeColor('disabled', appearance) : getThemeColor('placeholder', appearance)}
      />
    </TouchableOpacity>
  );
};

export default memo(SaveButton);
