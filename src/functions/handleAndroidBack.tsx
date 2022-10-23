// packages
import { BackHandler, Platform } from 'react-native';

import { NavigationScreenProp } from 'react-navigation';
import { useEffect } from 'react';

/**
 * Attaches an event listener that handles the android-only hardware
 * back button
 * @param  {Function} callback The function to call on click
 */

const handleAndroidBackButton = (callback: Function) => {
  const handler = BackHandler.addEventListener('hardwareBackPress', () => {
    callback();
    return true;
  });
  return handler;
};

/**
 * Removes the event listener in order not to add a new one
 * every time the view component re-mounts
 */
const removeAndroidBackButtonHandler = () => {
  BackHandler.removeEventListener('hardwareBackPress', () => {});
};

// const useHandleAndroidBack = (navigation: NavigationScreenProp<any, any>, callback: () => void) => {
//   if (Platform.OS === 'ios') return;
//   useEffect(() => {
//     const handler = () => {
//       callback();
//       return true;
//     };
//     const didFocusSubscription = navigation.addListener('didFocus', () => {
//       BackHandler.addEventListener('hardwareBackPress', handler);
//     });
//     const willBlurSubscription = navigation.addListener('willBlur', () => {
//       BackHandler.removeEventListener('hardwareBackPress', handler);
//     });
//     return () => {
//       didFocusSubscription.remove();
//       willBlurSubscription.remove();
//     };
//   }, []);
// };

const useHandleAndroidBack = (navigation: NavigationScreenProp<any, any>, callback: () => void) => {
  if (Platform.OS === 'ios') return;
  useEffect(() => {
    const handler = () => {
      if (!navigation.isFocused()) {
        return false;
      }
      if (!!callback) {
        callback();
        return true;
      } else {
        return false;
      }
    };
    // const didFocusSubscription = navigation.addListener('didFocus', () => {
    BackHandler.addEventListener('hardwareBackPress', handler);
    // });
    // const willBlurSubscription = navigation.addListener('willBlur', () => {
    // });
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handler);
    };
  }, []);
};

export { handleAndroidBackButton, removeAndroidBackButtonHandler };
export default useHandleAndroidBack;
