import { AppearanceType, PostData, StoreAction } from '../types/store';

import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { Dispatch } from 'react';
import { MutationFunction } from '@apollo/react-common';
import { NavigationInjectedProps } from 'react-navigation';
import { PostStatus } from '../API';
import { WarningProps } from '../components/WarningDialog';

import postEdit from './postEdit';
import postStatusChange from './postStatusChange';
import reportSentry from './reportSentry';
import { getCompStyles } from '../configs/compStyles';

interface Args extends NavigationInjectedProps {
  postItem: PostData;
  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void;
  refetch: any;
  updatePostStatus: MutationFunction;
  origin: string;
  storeDispatch: Dispatch<StoreAction>;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  imgURLs: string[];
  appearance: AppearanceType;
}

const openPostAuthorActionSheet = ({
  postItem,
  showActionSheetWithOptions,
  refetch,
  updatePostStatus,
  navigation,
  origin,
  storeDispatch,
  setWarningProps,
  imgURLs,
  appearance,
}: Args) => () => {
  const compStyles = getCompStyles(appearance);
  const { id: postId, postStatus } = postItem!;
  // console.log(classHostId);
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
    edit: {
      text: '게시물 수정',
      callback: postEdit(postItem, navigation, origin, storeDispatch, imgURLs),
    },
    delete: {
      text: '게시물 삭제',
      callback: () =>
        setWarningProps({
          dismissable: true,
          dialogTitle: '게시물 삭제',
          dialogContent: '게시물을 삭제합니다. 돌이킬 수 없습니다. 그래도 진행하시겠습니까',
          dismissText: '아니요',
          okText: '삭제합니다',
          handleOk: postStatusChange(postId, PostStatus.deleted, updatePostStatus),
        }),
    },
  };

  // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  const options = [
    ...(!isTabPostList ? [actions.reload.text] : []),
    ...(postStatus === PostStatus.open && !isTabPostList ? [actions.edit.text] : []),
    ...(postStatus === PostStatus.open ? [actions.delete.text] : []),

    '닫기',
  ];
  const destructiveButtonIndex = options.findIndex(value => value === '게시물 삭제');
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
      if (options[buttonIndex] === actions.edit.text) {
        await actions.edit.callback();
      }
      if (options[buttonIndex] === actions.delete.text) {
        await actions.delete.callback();
      }
      // Do something here depending on the button index selected
    },
  );
};

export default openPostAuthorActionSheet;
