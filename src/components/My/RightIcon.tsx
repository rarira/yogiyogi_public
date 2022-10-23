import React, { memo } from 'react';

import { List } from 'react-native-paper';
import { getStyles } from '../../configs/styles';
import { getThemeColor } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props {
  icon?: string;
  color?: string;
}
const RightIcon = ({ icon, color }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getStyles(appearance);

  return (
    <List.Icon
      icon={icon || 'keyboard-arrow-right'}
      color={color || getThemeColor('text', appearance)}
      style={styles.listIcon}
    />
  );
};

export default memo(RightIcon);
