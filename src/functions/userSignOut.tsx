import AsyncStorage from '@react-native-community/async-storage';
import Auth from '@aws-amplify/auth';
import { NavigationScreenProp } from 'react-navigation';
import OneSignal from 'react-native-onesignal';
import { Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { USER_SIGNED_OUT } from '../stores/actionTypes';
import reportSentry from '../functions/reportSentry';

const userSignOut = async (storeDispatch: any, navigation: NavigationScreenProp<any>) => {
  try {
    const hearts = await AsyncStorage.getItem('guest_hearts');

    storeDispatch({ type: USER_SIGNED_OUT, hearts: hearts ?? { count: 0, used: false } });

    OneSignal.deleteTag('optIn');
    OneSignal.deleteTag('messageOptIn');
    OneSignal.deleteTag('reviewOptIn');
    OneSignal.deleteTag('commOptIn');
    // OneSignal.removeExternalUserId();

    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeAllDeliveredNotifications();
    } else if (Platform.OS === 'android') {
      OneSignal.clearOneSignalNotifications();
    }

    await Auth.signOut();
  } catch (e) {
    reportSentry(e);
  }
};

export default userSignOut;
