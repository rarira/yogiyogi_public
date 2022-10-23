import React, { memo } from 'react';
import { Dialog } from 'react-native-paper';

import MyDialogContainer from './MyDialogContainer';
import DialogContentText from './DialogContentText';
import ThemedButton from './ThemedButton';
import { AppearanceType } from '../types/store';
import { getThemeColor } from '../configs/theme';
import MyDialogTitle from './MyDialogTitle';

interface Props {
  title: string;
  onCancel: () => void;
  cancelVisible: boolean;
  setCancelVisible: (arg: boolean) => void;
  description?: string;
  appearance: AppearanceType;
}

const CancelDialog = ({ title, onCancel, cancelVisible, setCancelVisible, description, appearance }: Props) => {
  const handleDismiss = () => setCancelVisible(false);
  const accentColor = getThemeColor('accent', appearance);
  return (
    <MyDialogContainer visible={cancelVisible} onDismiss={handleDismiss} dismissable={true}>
      <MyDialogTitle>{title}</MyDialogTitle>
      <Dialog.Content>
        <DialogContentText text={description || '진행 중이던 데이터가 모두 초기화됩니다.'} />
        <DialogContentText text="그래도 중단하시겠습니까?" />
      </Dialog.Content>
      <Dialog.Actions>
        <ThemedButton onPress={handleDismiss}>계속하기</ThemedButton>
        <ThemedButton onPress={onCancel} color={accentColor}>
          중단하기
        </ThemedButton>
      </Dialog.Actions>
    </MyDialogContainer>
  );
};

export default memo(CancelDialog);
