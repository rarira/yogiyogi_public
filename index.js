// import './before';

import App from './src/App';
import { AppRegistry } from 'react-native';
import { LogBox } from 'react-native';
import { name as appName } from './app.json';

LogBox.ignoreLogs([
  'Warning: componentWillMount is deprecated',
  'Warning: componentWillReceiveProps is deprecated',
  'Warning: Async Storage',
  'Warning: Slider',
  'Warning: ViewPagerAndroid',
  'Warning: RNCNetInfo',
  'Warning: DatePickerIOS',
  'Require cycle:',
  '`-[RCTRootView cancelTouches]`',
  'Setting a timer',
  'Warning: VirtualizedLists',
]);

LogBox.ignoreAllLogs();
AppRegistry.registerComponent(appName, () => App);
