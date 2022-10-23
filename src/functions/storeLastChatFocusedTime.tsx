import AsyncStorage from '@react-native-community/async-storage';
import reportSentry from './reportSentry';

const storeLastChatFocusedTime = async (userId: string) => {
  const now = new Date().toISOString();

  try {
    await AsyncStorage.setItem(`${userId}_lastChatFocusedTime`, now);
  } catch (e) {
    reportSentry(e);
  }
};

export default storeLastChatFocusedTime;
