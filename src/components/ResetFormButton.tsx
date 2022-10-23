import React, { memo } from 'react';
import theme, { getThemeColor, normalize } from '../configs/theme';

import { ButtonProps } from 'react-native-paper';
import NextProcessButton from './NextProcessButton';
import { StyleSheet } from 'react-native';
import { useStoreState } from '../stores/initStore';

interface Props extends Partial<ButtonProps> {
  onPress: () => void;
  isModal?: boolean;
}

const ResetFormButton = ({ onPress, children, isModal }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const accentColor = getThemeColor('accent', appearance);

  return (
    <NextProcessButton
      onPress={onPress}
      marginHorizontalNeedless
      color={accentColor}
      containerStyle={[
        styles.container,
        ...(isModal ? [{ backgroundColor: getThemeColor('uiBackground', appearance) }] : []),
      ]}
      // textStyle={styles.text}
    >
      {children || '모두 삭제'}
    </NextProcessButton>
  );
};

const styles = StyleSheet.create({
  container: { width: normalize(100), marginRight: theme.size.big },
});

export default memo(ResetFormButton);
