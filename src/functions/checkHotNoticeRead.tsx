import AsyncStorage from '@react-native-community/async-storage';
import reportSentry from './reportSentry';

const checkHotNoticeRead = async (id: string, username?: string) => {
  try {
    const check = await AsyncStorage.getItem(
      username ? `${username}_hotNotice_${id}_read` : `guest_hotNotice_${id}_read`,
    );
    if (check === 'true') {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    reportSentry(e);
  }
};

export default checkHotNoticeRead;
