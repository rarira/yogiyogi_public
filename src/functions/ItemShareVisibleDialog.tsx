import { Dialog } from 'react-native-paper';
import React from 'react';

import DialogContentText from '../components/DialogContentText';
import MyDialogContainer from '../components/MyDialogContainer';
import ThemedButton from '../components/ThemedButton';
import MyDialogTitle from '../components/MyDialogTitle';
import { getTheme } from '../configs/theme';
import { AppearanceType, PostData, PostNumbers } from '../types/store';
import { handleClassShare, handlePostShare } from '../components/classView/KakaoShare';
import { GetClassQuery } from '../API';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { shallowEqual } from 'recompose';

interface Props {
  itemName: string;
  suffix: string;
  shareVisible: boolean;
  setShareVisible: (arg: boolean) => void;
  updated: string;
  appearance: AppearanceType;
  item?: Partial<GetClassQuery['getClass']>;
  postItem?: PostData;

  shareImageURL?: string;
}

const ItemShareVisibleDialog = ({
  itemName,
  suffix,
  shareVisible,
  setShareVisible,
  updated,
  appearance,
  item,
  postItem,
  shareImageURL,
}: Props) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const _handleDismissShareVisible = () => setShareVisible(false);

  const _handleShareOpen = () => {
    if (shareVisible) {
      setShareVisible(false);
    }
    if (itemName === '클래스') {
      handleClassShare(item!, showActionSheetWithOptions, appearance)();
    } else if (itemName === '게시물') {
      const { numOfLikes, numOfComments, numOfViews, thumbnailURL } = postItem!;

      const postNumbers: PostNumbers = {
        numOfLikes,
        numOfComments,
        numOfViews,
      };
      handlePostShare(postItem!, showActionSheetWithOptions, shareImageURL || thumbnailURL!, postNumbers, appearance)();
    }
  };
  // if (shareButtonEl) {
  //   setShareVisible(false);
  //   shareButtonEl.current!.touchableHandlePress();
  // } else {

  // }

  const theme = getTheme(appearance);

  return (
    <MyDialogContainer visible={shareVisible} onDismiss={_handleDismissShareVisible} dismissable={true}>
      <MyDialogTitle>{itemName} 공유</MyDialogTitle>
      <Dialog.Content>
        <DialogContentText
          text={`새로 ${
            updated === 'updated' ? '수정' : '등록'
          }한 ${itemName}${suffix} 카카오톡 대화방 등에 공유하시겠습니까?`}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <ThemedButton onPress={_handleDismissShareVisible} color={theme.colors.error}>
          아니오
        </ThemedButton>
        <ThemedButton onPress={_handleShareOpen}>네, 공유합니다</ThemedButton>
      </Dialog.Actions>
    </MyDialogContainer>
  );
};

export default ItemShareVisibleDialog;
