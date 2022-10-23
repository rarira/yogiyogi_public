import { ButtonProps } from 'react-native-paper';
import React from 'react';
import { Button } from 'react-native-paper';

import { getThemeColor } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

const ThemedButton: React.FunctionComponent<ButtonProps> = ({ color, children, ...rest }) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const themedColor = color || getThemeColor('primary', appearance);

  return (
    <Button color={themedColor} {...rest}>
      {children}
    </Button>
  );
};

export default ThemedButton;
