import { BottomTabBar, BottomTabBarProps } from 'react-navigation-tabs';
import { StyleSheet, View } from 'react-native';

import NewTabIcon from './NewTabIcon';
import React from 'react';
import getDimensions from '../functions/getDimensions';
import { getThemeColor } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

interface Props extends BottomTabBarProps {}

const { SCREEN_WIDTH } = getDimensions();
const CustomTabBar = (props: Props) => {
  const {
    authStore: { isNewButtonTouched, appearance },
  } = useStoreState();

  const addedProps = {
    activeTintColor: getThemeColor('accent', appearance),
    inactiveTintColor: getThemeColor('placeholder', appearance),
    // inactiveTintColor: 'white',
    showLabel: true,
    style: {
      backgroundColor: getThemeColor('uiBackground', appearance),
      borderTopColor: getThemeColor('grey200', appearance),
      borderTopWidth: StyleSheet.hairlineWidth,
    },
  };

  return (
    <View style={styles.container}>
      <BottomTabBar
        {...props}
        {...addedProps}
        // tabStyle={{ borderWidth: 1, borderColor: 'blue', alignItems: 'center' }}
      />

      <View style={[styles.buttonContainer, ...(isNewButtonTouched ? [{ top: -15 }] : [])]}>
        <NewTabIcon />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'column' },
  buttonContainer: {
    position: 'absolute',
    top: -10,
    left: (SCREEN_WIDTH / 4) * 3,
    height: 100,
    width: SCREEN_WIDTH / 4,
    flexDirection: 'row',
    justifyContent: 'center',
    // zIndex: 100,
    elevation: 100,
    // borderWidth: 1,
    // borderColor: 'red',
  },
});

export default CustomTabBar;
