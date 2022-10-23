import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { getCompStyles } from '../configs/compStyles';
import { AppearanceType } from '../types/store';

interface Args {
  simpleShare: () => Promise<void>;
  kakaoLinkShare: () => void;
  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void;
  appearance: AppearanceType;
}

const openClassShareActionSheet = ({
  simpleShare,
  kakaoLinkShare,
  showActionSheetWithOptions,
  appearance,
}: Args) => () => {
  const compStyles = getCompStyles(appearance);

  const actions = {
    kakaoLinkShare: {
      text: '카카오톡 대화방에 공유',
      callback: () => {
        kakaoLinkShare();
      },
    },
    simpleShare: {
      text: '공유',
      callback: async () => await simpleShare(),
    },
  };

  // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  const options = [actions.kakaoLinkShare.text, actions.simpleShare.text, '닫기'];
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
      if (options[buttonIndex] === actions.kakaoLinkShare.text) {
        await actions.kakaoLinkShare.callback();
      }
      if (options[buttonIndex] === actions.simpleShare.text) {
        await actions.simpleShare.callback();
      }

      // Do something here depending on the button index selected
    },
  );
};

export default openClassShareActionSheet;
