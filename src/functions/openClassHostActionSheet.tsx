import { ClassStatusType, GetClassQuery, ReviewType } from '../API';

import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { ClassData } from '../types/apiResults';
import { Dispatch } from 'react';
import { MutationFunction } from '@apollo/react-common';
import { NavigationInjectedProps } from 'react-navigation';
import { AppearanceType, StoreAction } from '../types/store';
import { WarningProps } from '../components/WarningDialog';
import classEdit from './classEdit';
import classPushUp from './classPushUp';
import classToggleCancel from './classToggleCancel';
import classToggleReserve from './classToggleReserve';
import reportSentry from './reportSentry';
import { getCompStyles } from '../configs/compStyles';

interface Args extends NavigationInjectedProps {
  classItem: Partial<GetClassQuery['getClass']> | ClassData;
  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void;
  refetch: any;
  updateClassStatus: MutationFunction;
  origin: string;
  storeDispatch: Dispatch<StoreAction>;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  appearance: AppearanceType;
}

const openClassHostActionSheet = ({
  classItem,
  showActionSheetWithOptions,
  refetch,
  updateClassStatus,
  navigation,
  origin,
  storeDispatch,
  setWarningProps,
  appearance,
}: Args) => () => {
  const compStyles = getCompStyles(appearance);

  const {
    id: classId,
    classStatus,
    timeStart,
    classProxyReviewId,
    classHostReviewId,
    // host: { id: classHostId },
  } = classItem!;
  // console.log(classHostId);
  const isTabClassList = origin === 'ClassList';
  const nowEpochSec = new Date().getTime() / 1000;
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
    pushUp: {
      text: '끌어 올리기',
      callback: classPushUp(
        updateClassStatus,
        classId!,
        classStatus!,
        refetch,
        classItem!.updateCounter!,
        isTabClassList,
      ),
    },

    edit: {
      text: '클래스 수정',
      callback: classEdit(classItem, navigation, origin, storeDispatch, false),
    },

    repost: {
      text: '비슷한 클래스 다시 등록',
      callback: classEdit(classItem, navigation, origin, storeDispatch, true),
    },

    toggleReserve: {
      text: classStatus === ClassStatusType.open ? `'선생님 예약됨'으로 변경` : `'구인 중'으로 변경`,
      callback: classToggleReserve(updateClassStatus, classId!, classStatus!),
    },

    toggleCancel: {
      text: classStatus === ClassStatusType.cancelled ? `'구인 중'으로 변경` : `클래스 취소`,
      callback: classToggleCancel(
        updateClassStatus,
        classId!,
        classStatus!,
        setWarningProps,
        timeStart!,
        origin,
        // classHostId,
      ),
    },

    viewProxyReview: {
      text: '작성한 선생님 리뷰 보기',
      callback: () => {
        navigation.navigate('ViewReview', { reviewId: classProxyReviewId, origin, reviewType: ReviewType.proxyReview });
      },
    },
    viewHostReview: {
      text: '받은 리뷰 보기',
      callback: () => {
        navigation.navigate('ViewReview', { reviewId: classHostReviewId, origin, reviewType: ReviewType.hostReview });
      },
    },
  };

  // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  const options = [
    ...(!isTabClassList ? [actions.reload.text] : []),
    // ...(classStatus !== ClassStatusType)
    ...(classStatus === ClassStatusType.open ? [actions.pushUp.text] : []),
    ...(classStatus === ClassStatusType.proxied ? [actions.viewProxyReview.text] : []),
    ...(classStatus === ClassStatusType.reviewed ? [actions.viewProxyReview.text, actions.viewHostReview.text] : []),
    ...(classStatus === ClassStatusType.reserved || classStatus === ClassStatusType.open
      ? [actions.toggleReserve.text]
      : []),
    ...(classStatus === ClassStatusType.open && !isTabClassList ? [actions.edit.text] : []),
    ...[actions.repost.text],
    ...(classStatus === ClassStatusType.open || (classStatus === ClassStatusType.cancelled && timeStart! > nowEpochSec)
      ? [actions.toggleCancel.text]
      : []),
    '닫기',
  ];
  const destructiveButtonIndex = options.findIndex(value => value === '클래스 취소');
  const cancelButtonIndex = options.length - 1;

  if (options.length === 1) return null;

  showActionSheetWithOptions(
    {
      options,
      cancelButtonIndex,
      destructiveButtonIndex,
      // title,

      showSeparators: true,
      textStyle: compStyles.actionSheetTextStyle,
      separatorStyle: compStyles.actionSheetSeparatorStyle,
      containerStyle: compStyles.actionSheetContainerStyle,
    },
    async buttonIndex => {
      if (options[buttonIndex] === actions.reload.text) {
        await actions.reload.callback();
      }
      if (options[buttonIndex] === actions.repost.text) {
        await actions.repost.callback();
      }
      if (options[buttonIndex] === actions.pushUp.text) {
        await actions.pushUp.callback();
      }
      if (options[buttonIndex] === actions.edit.text) {
        actions.edit.callback();
      }
      if (options[buttonIndex] === actions.toggleReserve.text && classStatus !== ClassStatusType.cancelled) {
        await actions.toggleReserve.callback();
      }
      if (options[buttonIndex] === actions.toggleCancel.text) {
        await actions.toggleCancel.callback();
      }
      if (options[buttonIndex] === actions.viewProxyReview.text) {
        actions.viewProxyReview.callback();
      }
      if (options[buttonIndex] === actions.viewHostReview.text) {
        actions.viewHostReview.callback();
      }
      // Do something here depending on the button index selected
    },
  );
};

export default openClassHostActionSheet;
