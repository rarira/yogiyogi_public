import React, { memo } from 'react';

import IconWithBadge from '../IconWithBadge';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getThemeColor } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props {
  focused: boolean;
  tintColor: string;
}

const MyStackIcon = ({ focused, tintColor }: Props) => {
  const {
    authStore: { heartsUpdated, appearance },
  } = useStoreState();

  if (heartsUpdated)
    return (
      <IconWithBadge
        fullName="heart"
        name="heart-outline"
        color={tintColor}
        fullColor={getThemeColor('accent', appearance)}
        focused={focused}
        dataName="hearts"
      />
    );
  return <MaterialIcons name="person-outline" color={tintColor} size={focused ? 32 : 25} />;
};

export default memo(MyStackIcon);
