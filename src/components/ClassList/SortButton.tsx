import React, { memo } from 'react';
import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import theme from '../../configs/theme';

interface Props extends TouchableWithoutFeedbackProps {
  sort: string;
  setSort: (arg: string) => void;
}
const SortButton = ({ sort, setSort, ...rest }: Props) => {
  const name = sort.toLowerCase() === 'desc' ? 'sort-numeric-desc' : 'sort-numeric-asc';

  const _handleOnPress = () => {
    setSort(sort.toLowerCase() === 'desc' ? 'asc' : 'desc');
  };
  return (
    <TouchableOpacity onPress={_handleOnPress} hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }} {...rest}>
      <Icon name={name} size={theme.iconSize.small} color={theme.colors.primary} />
    </TouchableOpacity>
  );
};

export default memo(SortButton);
