import { ClassStatusType, GetClassQuery, ReviewType } from '../API';
import { NavigationParams, NavigationRoute, NavigationScreenProp } from 'react-navigation';

import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { ClassData } from '../types/apiResults';
import { CognitoUser } from '@aws-amplify/auth';
import { MutationFunction } from '@apollo/react-common';
import { WarningProps } from '../components/WarningDialog';
import classBlock from './classBlock';

import reportSentry from './reportSentry';
import { getCompStyles } from '../configs/compStyles';
import { AppearanceType } from '../types/store';

interface Args {
  classItem: Partial<GetClassQuery['getClass']> | ClassData;
  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void;
  refetch: any;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  user: CognitoUser | any | null;
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  origin: string;
  addClassBlock?: MutationFunction;
  setModalVisible?: (arg: boolean) => void;
  appearance: AppearanceType;
}

const openClassUserActionSheet = ({
  classItem,
  showActionSheetWithOptions,
  refetch,
  setWarningProps,
  user,
  navigation,
  origin,
  addClassBlock,
  setModalVisible,
  appearance,
}: Args) => () => {
  const compStyles = getCompStyles(appearance);

  const { id: classId, classHostReviewId, classProxyReviewId, classStatus } = classItem!;
  const isTabClassList = origin === 'ClassList';
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
    ...(!!user && {
      block: {
        text: '클래스 차단하기',
        callback: classBlock(addClassBlock!, classId!, user!.username!, setWarningProps),
      },
    }),
    ...(!!user && {
      report: {
        text: '클래스 신고하기',
        callback: () => setModalVisible!(true),
      },
    }),
    ...(!!user && {
      viewProxyReview: {
        text: '받은 리뷰 보기',
        callback: () => {
          navigation.navigate('ViewReview', {
            reviewId: classProxyReviewId,
            origin,
            reviewType: ReviewType.proxyReview,
          });
        },
      },
    }),
    ...(!!user && {
      viewHostReview: {
        text: '작성한 호스트 리뷰 보기',
        callback: () => {
          navigation.navigate('ViewReview', {
            reviewId: classHostReviewId,
            origin,
            reviewType: ReviewType.hostReview,
          });
        },
      },
    }),
  };
  // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  const options = [
    ...(!isTabClassList ? [actions.reload.text] : []),
    ...(user !== null && addClassBlock && setModalVisible ? [actions.block!.text, actions.report!.text] : []),
    ...(user !== null && classStatus === ClassStatusType.proxied ? [actions.viewProxyReview.text] : []),
    ...(user !== null && classStatus === ClassStatusType.reviewed
      ? [actions.viewHostReview.text, actions.viewProxyReview.text]
      : []),
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
      if (!!user && options[buttonIndex] === actions.block.text) {
        await actions.block.callback();
      }
      if (!!user && options[buttonIndex] === actions.report.text) {
        await actions.report.callback();
      }
      if (!!user && options[buttonIndex] === actions.viewHostReview.text) {
        actions.viewHostReview.callback();
      }
      if (!!user && options[buttonIndex] === actions.viewProxyReview.text) {
        actions.viewProxyReview.callback();
      }
      // Do something here depending on the button index selected
    },
  );
};

export default openClassUserActionSheet;
