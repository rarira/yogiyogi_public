import { call, sendEmail, sendText } from './dealComm';

import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { AppearanceType } from '../types/store';
import { getCompStyles } from '../configs/compStyles';

interface Args {
  email?: string;
  phone?: string;
  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void;
  appearance: AppearanceType;
}

const insertText = '안녕하세요. 요기요기에서 보고 연락드립니다.';

const openAdminPostActionSheet = ({ email, phone, showActionSheetWithOptions, appearance }: Args) => () => {
  const compStyles = getCompStyles(appearance);

  const textSendable = phone && phone.startsWith('01');
  const actions = {
    sendEmail: {
      text: '이메일로 연락',
      callback: () => {
        // console.log('will send email to: ', email);
        sendEmail(email!, insertText);
      },
    },
    sendText: {
      text: '문자 보내기',
      callback: () => {
        // console.log('will send text to: ', phone);
        sendText(phone!, insertText);
      },
    },
    call: {
      text: '전화하기',
      callback: () => {
        // console.log('will call to: ', phone);
        call(phone!);
      },
    },
  };

  // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  const options = [
    ...(email ? [actions.sendEmail.text] : []),
    ...(textSendable ? [actions.sendText.text] : []),
    ...(phone ? [actions.call.text] : []),

    '닫기',
  ];
  const cancelButtonIndex = options.length - 1;

  if (options.length === 1) return null;

  showActionSheetWithOptions(
    {
      options,
      cancelButtonIndex,
      showSeparators: true,
      textStyle: compStyles.actionSheetTextStyle,
      separatorStyle: compStyles.actionSheetSeparatorStyle,
      containerStyle: compStyles.actionSheetContainerStyle,
    },
    async buttonIndex => {
      if (options[buttonIndex] === actions.sendEmail.text) {
        await actions.sendEmail.callback();
      }
      if (options[buttonIndex] === actions.sendText.text) {
        await actions.sendText.callback();
      }
      if (options[buttonIndex] === actions.call.text) {
        actions.call.callback();
      }

      // Do something here depending on the button index selected
    },
  );
};

export default openAdminPostActionSheet;
