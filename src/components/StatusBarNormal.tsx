import React, { memo } from 'react';
import { Platform, StatusBar, StatusBarStyle } from 'react-native';

import { AppearanceType } from '../types/store';
import { getThemeColor } from '../configs/theme';

interface Props {
  switchScreen?: boolean;
  barStyle?: StatusBarStyle;
  backgroundColor?: string;
  translucent?: boolean;
  appearance?: AppearanceType;
}
const StatusBarNormal = ({ switchScreen, barStyle, backgroundColor, translucent, appearance }: Props) => {
  const placeholderColor = getThemeColor('borderColor', appearance);
  return (
    <StatusBar
      barStyle={barStyle !== undefined ? barStyle : appearance === AppearanceType.DARK ? 'light-content' : 'dark-content'}
      backgroundColor={
        backgroundColor ? backgroundColor : !!switchScreen ? placeholderColor : appearance === AppearanceType.DARK ? 'black' : 'white'
        // ? placeholderColor
        // :  && appearance === AppearanceType.DARK
        // ? 'black'
        // : 'transparent'
      }
      translucent={translucent === true}
      animated={true}
    />
  );
};

export default memo(StatusBarNormal);
