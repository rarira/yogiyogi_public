import { Keyboard, KeyboardEventListener, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import theme, { getThemeColor } from '../configs/theme';

import Icon from 'react-native-vector-icons/MaterialIcons';
import throttle from 'lodash/throttle';
import { useStoreState } from '../stores/initStore';

interface Props {
  needMarginRight?: boolean;

  setKeyboardHeight?: (arg: number) => void;
}

const KeyboardDismissButton = ({ needMarginRight, setKeyboardHeight }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const hideListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

    const keyboardDidShowListener = Keyboard.addListener(showListener, _keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener(hideListener, _keyboardDidHide);
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const _keyboardDidShow: KeyboardEventListener = event => {
    setVisible(true);
    if (!!setKeyboardHeight) {
      // console.log('will set keyboard height', event.endCoordinates.height);
      setKeyboardHeight(event.endCoordinates.height);
    }
  };
  const _keyboardDidHide: KeyboardEventListener = event => {
    setVisible(false);
    if (!!setKeyboardHeight) {
      // console.log('will set keyboard height, null', event.endCoordinates.height);

      setKeyboardHeight(0);
    }
  };

  if (!visible) return null;

  return (
    <TouchableOpacity
      onPress={throttle(Keyboard.dismiss, 200)}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...(needMarginRight && { style: styles.mediumMarginRight })}
    >
      <Icon name="keyboard-hide" size={theme.iconSize.big} color={getThemeColor('placeholder', appearance)} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mediumMarginRight: { marginRight: theme.size.medium },
});

export default memo(KeyboardDismissButton);
