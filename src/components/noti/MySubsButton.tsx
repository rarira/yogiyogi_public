import React, { memo } from 'react';

import Icon from 'react-native-vector-icons/AntDesign';
import { NavigationInjectedProps } from 'react-navigation';
import { TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  origin: string;
  needLeftMargin?: boolean;
  appearance: AppearanceType;
}

const MySubsButton = ({ origin, navigation, needLeftMargin, appearance }: Props) => {
  const _handleNavToMySubs = () => navigation.push('MySubs', { origin });

  const theme = getTheme(appearance);

  return (
    <TouchableOpacity
      onPress={_handleNavToMySubs}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      style={{ marginLeft: needLeftMargin ? theme.size.normal : 0 }}
    >
      <Icon name="tagso" size={theme.iconSize.big} color={theme.colors.placeholder} />
    </TouchableOpacity>
  );
};

export default memo(withNavigation(MySubsButton));
