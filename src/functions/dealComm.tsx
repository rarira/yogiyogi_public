import { email, phonecall, text } from 'react-native-communications';

import { Platform } from 'react-native';
import { openComposer } from 'react-native-email-link';

export const sendEmail = (address: string, insertText: string) => {
  if (Platform.OS === 'ios') {
    openComposer({
      title: '이메일 클라이언트를 선택하세요',
      to: address,
      cancelLabel: '취소',
      body: insertText,
      message: '',
    });
  } else {
    email([address], null, null, null, insertText);
  }
};

export const sendText = (phone: string, insertText: string) => {
  text(phone, insertText);
};

export const call = (phone: string) => {
  phonecall(phone, true);
};
