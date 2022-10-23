import React, { memo } from 'react';
import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme, { getThemeColor } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

interface Props extends TouchableWithoutFeedbackProps {
  allList?: boolean | null;
  onPress: () => void;
  disabled?: boolean;
}
const SearchButton = ({ allList, onPress, disabled, ...rest }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
    >
      <Icon
        name={allList ? 'ios-list' : 'md-search'}
        size={theme.iconSize.big}
        color={disabled ? getThemeColor('disabled', appearance) : getThemeColor('placeholder', appearance)}
      />
    </TouchableOpacity>
  );
};

export default memo(SearchButton);
