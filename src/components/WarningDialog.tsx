import { Dialog } from 'react-native-paper';
import { MySnackbarAction, OPEN_SNACKBAR } from './MySnackbar';
import React, { useEffect, useState } from 'react';

import DialogContentText from './DialogContentText';
import MyDialogContainer from './MyDialogContainer';
import { NavigationScreenProp } from 'react-navigation';
import { memo } from 'react';
import reportSentry from '../functions/reportSentry';
import { getTheme } from '../configs/theme';
import ThemedButton from './ThemedButton';
import { AppearanceType } from '../types/store';
import MyDialogTitle from './MyDialogTitle';

export interface WarningProps {
  visible?: boolean;
  dismissable?: boolean;
  dialogTitle?: string;
  dialogContent?: any;
  handleDismiss?: () => void;
  handleOk?: () => void;
  dismissText?: string;
  okText?: string;
  loading?: boolean;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  origin?: string;
  navigateBack?: boolean;
  navigation: NavigationScreenProp<any, any>;
  appearance: AppearanceType;
}

const WarningDialog = ({
  visible,
  dismissable,
  dialogTitle,
  dialogContent,
  handleDismiss,
  handleOk,
  dismissText,
  okText,
  loading,
  snackbarDispatch,
  origin,
  navigateBack,
  navigation,
  appearance,
}: WarningProps) => {
  const [processing, setProcessing] = useState(false);
  const theme = getTheme(appearance);

  let _mounted = false;

  useEffect(() => {
    _mounted = true;

    return () => {
      _mounted = false;
    };
  }, []);

  const _handleOnPress = async () => {
    setProcessing(true);
    try {
      if (handleOk) {
        await handleOk();
      }
      if (navigateBack) {
        navigation.navigate(origin!, { origin });
      } else if (handleDismiss) {
        handleDismiss();
      }
    } catch (e) {
      if (handleDismiss) {
        handleDismiss();
      }
      // 에러 snackbar 출력
      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: e.message,
      });
      reportSentry(e);
    } finally {
      if (_mounted) {
        setProcessing(false);
      }
    }
  };

  return (
    <MyDialogContainer visible={visible!} onDismiss={handleDismiss} dismissable={dismissable} appearance={appearance}>
      <MyDialogTitle>{dialogTitle}</MyDialogTitle>
      <Dialog.Content>
        {typeof dialogContent === 'string' ? <DialogContentText text={dialogContent} /> : { dialogContent }}
      </Dialog.Content>
      <Dialog.Actions>
        <ThemedButton onPress={handleDismiss} color={theme.colors.accent}>
          {dismissText}
        </ThemedButton>
        <ThemedButton loading={loading || processing} onPress={_handleOnPress}>
          {okText}
        </ThemedButton>
      </Dialog.Actions>
    </MyDialogContainer>
  );
};

export default memo(WarningDialog);
