import * as colors from './colors';

import { ColorSchemeName, Dimensions, PixelRatio } from 'react-native';

import { AppearanceType } from '../types/store';
import { Theme } from 'react-native-paper';
import color from 'color';
import fonts from './fonts';
import { ReactText } from 'react';

// import getDimensions from '../functions/getDimensions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const IS_TABLET = SCREEN_WIDTH > 600;
const constant = SCREEN_WIDTH > 1000 ? 720 : IS_TABLET ? 500 : 300;
const scale = SCREEN_WIDTH / constant;

export function normalize(size: number): number {
  const newSize = size * scale;
  // if (Platform.OS === 'ios') {
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
  // } else {
  //   return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
  // }
}

export const lightColors: { [key: string]: string } = {
  primary: colors.deepPurple400,
  accent: colors.redA400,
  background: colors.white,
  cardBackground: color(colors.black)
    .alpha(0.02)
    .rgb()
    .string(),
  uiBackground: colors.grey50,
  surface: colors.white,
  error: colors.deepOrangeA700,
  text: colors.black,
  disabled: color(colors.black)
    .alpha(0.15)
    .rgb()
    .string(),
  grey200: colors.grey200,
  indigo700: colors.indigo700,
  focus: colors.lightBlue600,
  blue50: colors.blue50,
  iosBlue: '#147EFB',
  placeholder: color(colors.black)
    .alpha(0.65)
    .rgb()
    .string(),
  backdrop: color(colors.black)
    .alpha(0.5)
    .rgb()
    .string(),
  notification: colors.pink500,
  borderColor: colors.grey300,
  snackbar: '#323232',
  nearWhiteBG: '#f3f3f3',
  logoBG: '#341553',
  red: colors.redA700,
  gradientColors: ['#00000025', '#00000025', '#00000080'],
};

export const darkColors: { [key: string]: string } = {
  primary: colors.deepPurpleA100,
  accent: colors.lime300,
  background: colors.black,
  cardBackground: color(colors.white)
    .alpha(0.03)
    .rgb()
    .string(),
  uiBackground: colors.grey900,
  surface: colors.black,
  error: colors.orange500,
  text: colors.white,
  disabled: color(colors.white)
    .alpha(0.15)
    .rgb()
    .string(),
  grey200: colors.grey800,
  indigo700: colors.indigo200,
  focus: colors.lightBlue200,
  blue50: colors.blueA700,
  iosBlue: '#147EFB',
  placeholder: color(colors.white)
    .alpha(0.85)
    .rgb()
    .string(),
  backdrop: color(colors.white)
    .alpha(0.75)
    .rgb()
    .string(),
  notification: colors.yellow200,
  borderColor: colors.grey900,
  snackbar: colors.blueGrey100,
  nearWhiteBG: colors.grey800,
  logoBG: '#341553',
  red: colors.redA700,
  gradientColors: ['#dddddd85', '#dddddd85', '#ffffffaa'],
};

export const getThemeColor = (color: string, theme: AppearanceType | ColorSchemeName = AppearanceType.LIGHT): string => {
  const colors: { [key: string]: string | ReactText[] } = theme === AppearanceType.LIGHT ? lightColors : darkColors;
  return (colors[color] as string) || (lightColors[color] as string);
};
export interface ExtendedTheme extends Theme {
  colors: {
    primary: string;
    accent: string;
    background: string;
    uiBackground: string;
    surface: string;
    error: string;
    text: string;
    grey200: string;
    focus: string;
    blue50: string;
    disabled: string;
    placeholder: string;
    backdrop: string;
    notification: string;
    nearWhiteBG: string;
    borderColor: string;
  };
  fontSize: {
    heading: number;
    subheading: number;
    big: number;
    normal: number;
    small: number;
    medium: number;
    xs: number;
  };
  iconSize: {
    thumbnail: number;
    smallThumbnail: number;
    xl: number;
    big: number;
  };
  size: {
    xl: number;
    big: number;
    medium: number;
    normal: number;
    small: number;
    xs: number;
  };
}

export const getTheme = (theme: AppearanceType | ColorSchemeName = AppearanceType.LIGHT) => {
  return {
    dark: false,
    roundness: 4,
    colors: theme === AppearanceType.LIGHT ? lightColors : darkColors,
    fontSize: {
      title: normalize(42),
      heading: normalize(20),
      subheading: normalize(16),
      big: normalize(13),
      normal: normalize(12),
      medium: normalize(11),
      small: normalize(10),
      error: normalize(8),
      xs: normalize(6),
    },
    iconSize: {
      postThumbnail: normalize(60),
      thumbnail: normalize(52),
      smallThumbnail: normalize(40),
      xxl: normalize(32),
      xl: normalize(24),
      big: normalize(20),
      small: normalize(18),
    },
    size: {
      xl: normalize(24),
      big: normalize(16),
      medium: normalize(12),
      normal: normalize(8),
      small: normalize(4),
      xs: normalize(2),
    },
    fonts,
    chatColor: {
      defaultColor: '#b2b2b2',
      backgroundTransparent: 'transparent',
      defaultBlue: '#0084ff',
      leftBubbleBackground: '#f0f0f0',
      black: '#000',
      white: '#fff',
      carrot: '#e67e22',
      emerald: '#2ecc71',
      peterRiver: '#3498db',
      wisteria: '#8e44ad',
      alizarin: '#e74c3c',
      turquoise: '#1abc9c',
      midnightBlue: '#2c3e50',
      optionTintColor: '#007AFF',
      timeTextColor: '#aaa',
    },
  };
};

export default {
  dark: false,
  roundness: 4,
  colors: lightColors,
  fontSize: {
    title: normalize(42),
    heading: normalize(20),
    subheading: normalize(16),
    big: normalize(13),
    normal: normalize(12),
    medium: normalize(11),
    small: normalize(10),
    error: normalize(8),
    xs: normalize(6),
  },
  iconSize: {
    postThumbnail: normalize(60),
    thumbnail: normalize(52),
    smallThumbnail: normalize(40),
    xxl: normalize(32),
    xl: normalize(24),
    big: normalize(20),
    small: normalize(18),
  },
  size: {
    xl: normalize(24),
    big: normalize(16),
    medium: normalize(12),
    normal: normalize(8),
    small: normalize(4),
    xs: normalize(2),
  },
  fonts,
  chatColor: {
    defaultColor: '#b2b2b2',
    backgroundTransparent: 'transparent',
    defaultBlue: '#0084ff',
    leftBubbleBackground: '#f0f0f0',
    black: '#000',
    white: '#fff',
    carrot: '#e67e22',
    emerald: '#2ecc71',
    peterRiver: '#3498db',
    wisteria: '#8e44ad',
    alizarin: '#e74c3c',
    turquoise: '#1abc9c',
    midnightBlue: '#2c3e50',
    optionTintColor: '#007AFF',
    timeTextColor: '#aaa',
  },
};
