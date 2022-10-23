import React, { FunctionComponent } from 'react';
import { Text } from 'react-native';

import theme from '../configs/theme';

interface Props {
  tintColor: string;
}

const HeaderTitle: FunctionComponent<Props> = ({ children, tintColor }) => {
  const styles = {
    text: { color: tintColor, fontSize: theme.fontSize.big, fontWeight: '600' },
  };
  return (
    <Text numberOfLines={1} style={styles.text} ellipsizeMode={'tail'}>
      {children}
    </Text>
  );
};

export default HeaderTitle;
