import { NavigationParams, NavigationRoute, NavigationScreenProp } from 'react-navigation';

import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { CognitoUser } from '@aws-amplify/auth';
import { MutationFunction } from '@apollo/react-common';
import { WarningProps } from '../components/WarningDialog';

import postBlock from './postBlock';
import reportSentry from './reportSentry';
import { getCompStyles } from '../configs/compStyles';
import { AppearanceType } from '../types/store';

interface Args {
  postId: string;
  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void;
  refetch: any;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  user: CognitoUser | any | null;
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  origin: string;
  addPostBlock?: MutationFunction;
  setModalVisible?: (arg: boolean) => void;
  appearance: AppearanceType;
}

const openPostUserActionSheet = ({
  postId,
  showActionSheetWithOptions,
  refetch,
  setWarningProps,
  user,
  origin,
  addPostBlock,
  setModalVisible,
  appearance,
}: Args) => () => {
  const compStyles = getCompStyles(appearance);

  const isTabPostList = origin === 'TabPostList';
  const actions = {
    reload: {
      text: '새로고침',
      callback: async () => {
        try {
          await refetch();
        } catch (e) {
          reportSentry(e);
        }
      },
    },
    ...(!!user && {
      block: {
        text: '게시물 차단하기',
        callback: postBlock(addPostBlock!, postId!, user!.username!, setWarningProps),
      },
    }),
    ...(!!user && {
      report: {
        text: '게시물 신고하기',
        callback: () => setModalVisible!(true),
      },
    }),
  };
  // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  const options = [
    ...(!isTabPostList ? [actions.reload.text] : []),
    ...(user !== null && addPostBlock && setModalVisible ? [actions.block!.text, actions.report!.text] : []),

    '닫기',
  ];

  const cancelButtonIndex = options.length - 1;
  // const title = '게시물 관리';

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
      if (options[buttonIndex] === actions.reload.text) {
        await actions.reload.callback();
      }
      if (!!user && options[buttonIndex] === actions.block.text) {
        await actions.block.callback();
      }
      if (!!user && options[buttonIndex] === actions.report.text) {
        await actions.report.callback();
      }

      // Do something here depending on the button index selected
    },
  );
};

export default openPostUserActionSheet;
