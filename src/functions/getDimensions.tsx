import { Dimensions, Platform } from 'react-native';

import { StatusBar } from 'react-native';
import { hasNotch } from 'react-native-device-info';
import theme from '../configs/theme';

const getDimensions = () => {
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
  const IS_IPHONE_X = Platform.OS === 'ios' && hasNotch();
  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? 44 : 20) : StatusBar.currentHeight!;

  const HEADER_HEIGHT =
    Platform.OS === 'ios' ? (IS_IPHONE_X ? 88 : 64) : STATUS_BAR_HEIGHT + theme.iconSize.smallThumbnail;
  const NAV_BAR_HEIGHT = Platform.OS === 'ios' ? HEADER_HEIGHT - STATUS_BAR_HEIGHT : theme.iconSize.smallThumbnail;
  return { SCREEN_HEIGHT, SCREEN_WIDTH, IS_IPHONE_X, STATUS_BAR_HEIGHT, HEADER_HEIGHT, NAV_BAR_HEIGHT };
};

export default getDimensions;
