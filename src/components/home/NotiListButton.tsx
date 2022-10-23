import * as Animatable from 'react-native-animatable';

import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedbackProps, View } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useStoreState } from '../../stores/initStore';
import { getTheme } from '../../configs/theme';

interface Props extends TouchableWithoutFeedbackProps {
  onPress: () => void;
  needLeftMargin?: boolean;
}
const NotiListButton = ({ onPress, needLeftMargin, ...rest }: Props) => {
  const AnimatedIcon = Animatable.createAnimatableComponent(Icon);
  const iconEl = useRef(null);
  const {
    authStore: { newGenNotisAvailable, newClassNotisAvailable, newCommNotisAvailable, appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const hasNewNotis = newGenNotisAvailable || newClassNotisAvailable || newCommNotisAvailable;
  // console.log(newNotis, newClassNotis);
  useEffect(() => {
    let _mounted = true;
    if (_mounted && hasNewNotis) animateIcon();
    return () => {
      _mounted = false;
    };
  }, [hasNewNotis]);

  const animateIcon = () => {
    iconEl!.current!.stopAnimation();
    iconEl!.current!.swing(500);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      style={{ marginLeft: needLeftMargin ? theme.size.normal : 0 }}
      // styles={styles.container}
    >
      <AnimatedIcon
        ref={iconEl}
        name={'notifications-none'}
        color={theme.colors.placeholder}
        size={theme.iconSize.big}
        // style={styles.animatedIcon}
        duration={500}
        useNativeDriver
        // delay={200}
      />
      {hasNewNotis && <View style={styles.badge} />}
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    badge: {
      position: 'absolute',
      top: 0,
      left: theme.iconSize.big - 8,
      backgroundColor: theme.colors.accent,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });

export default memo(NotiListButton);
