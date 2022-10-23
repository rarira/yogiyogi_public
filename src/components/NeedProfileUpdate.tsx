import { Dialog } from 'react-native-paper';

import MyDialogContainer from './MyDialogContainer';
import { NavigationInjectedProps } from 'react-navigation';
import React from 'react';
import { memo } from 'react';
import { getThemeColor } from '../configs/theme';
import { withNavigation } from 'react-navigation';
import ThemedButton from './ThemedButton';
import { AppearanceType } from '../types/store';
import MyDialogTitle from './MyDialogTitle';
import DialogContentText from './DialogContentText';

interface Props extends NavigationInjectedProps {
  profileUpdated: boolean;
  setNeedProfileUpdateVisible?: (arg: boolean) => void;
  params?: { [key: string]: any };
  appearance: AppearanceType;
}

const NeedProfileUpdate = ({ navigation, profileUpdated, setNeedProfileUpdateVisible, params, appearance }: Props) => {
  const _handleDismiss = () => {
    setNeedProfileUpdateVisible!(false);
  };

  const _handleNavigateToBack = () => {
    // console.log(params.origin);
    if (setNeedProfileUpdateVisible) setNeedProfileUpdateVisible(false);
    navigation.navigate(params?.origin ?? 'Home');
  };

  const _handleNavigate = () => {
    if (setNeedProfileUpdateVisible) setNeedProfileUpdateVisible(false);
    navigation.navigate('UpdateProfile', params);
  };

  const dismissable = setNeedProfileUpdateVisible !== undefined;
  const accentColor = getThemeColor('accent', appearance);

  return (
    <MyDialogContainer visible={!profileUpdated} onDismiss={_handleDismiss} dismissable={dismissable}>
      <MyDialogTitle>프로필 업데이트 필요</MyDialogTitle>
      <Dialog.Content>
        <DialogContentText text="사진, 닉네임 등의 프로필 업데이트가 필요합니다" />
      </Dialog.Content>
      <Dialog.Actions>
        <ThemedButton onPress={dismissable ? _handleDismiss : _handleNavigateToBack} color={accentColor}>
          {dismissable ? '그대로 계속 이용' : 'Home으로'}
        </ThemedButton>
        <ThemedButton onPress={_handleNavigate}>업데이트</ThemedButton>
      </Dialog.Actions>
    </MyDialogContainer>
  );
};

export default memo(withNavigation(NeedProfileUpdate));
