import { Dialog } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';

import DialogContentText from '../components/DialogContentText';
import MyDialogContainer from '../components/MyDialogContainer';
import React from 'react';
import ThemedButton from '../components/ThemedButton';
import MyDialogTitle from '../components/MyDialogTitle';
import { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

interface Props extends NavigationInjectedProps {
  itemName: string;
  suffix: string;
  dialogVisible: boolean;
  updateMode: boolean;
  handleCancelButton(): void;
  handleOnDismiss(): void;
  handleNavigation(): void;
  appearance: AppearanceType;
}

const ItemAfterCreateDialog = ({
  itemName,
  suffix,
  dialogVisible,
  updateMode,
  handleOnDismiss,
  handleCancelButton,
  handleNavigation,
  appearance,
}: Props) => {
  return (
    <MyDialogContainer visible={dialogVisible} onDismiss={handleOnDismiss} dismissable={false}>
      <MyDialogTitle>
        {itemName} {updateMode ? '수정' : '등록'} 완료
      </MyDialogTitle>
      <Dialog.Content>
        <DialogContentText text={`${itemName}${suffix} 성공적으로 ${updateMode ? '수정' : '작성'}하였습니다`} />
      </Dialog.Content>
      <Dialog.Actions>
        <ThemedButton onPress={handleCancelButton}>확인</ThemedButton>
        <ThemedButton onPress={handleNavigation} color={getThemeColor('accent', appearance)}>
          {updateMode ? '수정' : '작성'}한 {itemName} 보기
        </ThemedButton>
      </Dialog.Actions>
    </MyDialogContainer>
  );
};

export default withNavigation(ItemAfterCreateDialog);
