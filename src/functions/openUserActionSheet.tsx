import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { Alert } from 'react-native';
import { CognitoUser } from '@aws-amplify/auth';
import { MutationFunction } from '@apollo/react-common';
import { NavigationScreenProp } from 'react-navigation';
import { WarningProps } from '../components/WarningDialog';
import { getCompStyles } from '../configs/compStyles';
import reportSentry from './reportSentry';
import userBlock from './userBlock';
import { AppearanceType } from '../types/store';

interface Args {
  userId: string;
  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void;
  refetch: any;
  addUserBlock?: MutationFunction;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  user: CognitoUser | any | null;
  setModalVisible?: (arg: boolean) => void;
  navigation: NavigationScreenProp<any, any>;
  isReviewable: boolean;
  userName: string;
  origin: string;
  appearance: AppearanceType;
}

const openUserActionSheet = ({
  userId,
  showActionSheetWithOptions,
  refetch,
  addUserBlock,
  setWarningProps,
  user,
  setModalVisible,
  navigation,
  isReviewable,
  userName,
  origin,
  appearance,
}: Args) => () => {
  const compStyles = getCompStyles(appearance);

  const isMyself = user && userId === user.username;

  const actions = {
    reload: {
      text: '새로고침',
      callback: async () => {
        try {
          refetch();
        } catch (e) {
          reportSentry(e);
        }
      },
    },
    review: {
      text: '사용자 리뷰',
      callback: () => navigation.push('UserReview', { userId, userName }),
    },
    reviewed: {
      text: '사용자 리뷰 완료됨',
      callback: () => Alert.alert('이미 사용자 리뷰를 작성했습니다'),
    },
    block: {
      text: '사용자 차단하기',
      callback: userBlock(addUserBlock!, userId!, user!.username!, setWarningProps),
    },

    report: {
      text: '사용자 신고하기',
      callback: () => setModalVisible!(true),
    },
  };

  // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  const options = [
    actions.reload.text,
    ...(isMyself
      ? []
      : isReviewable && origin === 'ChatView'
      ? [actions.review!.text, actions.block!.text, actions.report!.text]
      : !isReviewable && origin === 'ChatView'
      ? [actions.reviewed!.text, actions.block!.text, actions.report!.text]
      : [actions.block!.text, actions.report!.text]),
    '닫기',
  ];
  const cancelButtonIndex = options.length - 1;
  // const title = '클래스 관리';

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

      if (options[buttonIndex] === actions.review.text) {
        await actions.review.callback();
      }
      if (options[buttonIndex] === actions.reviewed.text) {
        await actions.reviewed.callback();
      }
      if (options[buttonIndex] === actions.block.text) {
        await actions.block.callback();
      }
      if (options[buttonIndex] === actions.report.text) {
        await actions.report.callback();
      }
      // Do something here depending on the button index selected
    },
  );
};

export default openUserActionSheet;
