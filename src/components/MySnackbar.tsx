import { AppearanceType, StoreAction } from '../types/store';
import React, { memo } from 'react';

import { Snackbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { getThemeColor } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

interface MySnackbarState {
  snackbarVisible: boolean;
  sideEffect?: (arg?: any) => void;
  message?: string;
  snackbarType?: string;
  duration?: number;
}

export const OPEN_SNACKBAR = 'openSnackbar';
export const CLOSE_SNACKBAR = 'closeSnackbar';
interface Props {
  snackbarState: MySnackbarState;
  dispatch: (arg: MySnackbarAction) => void;
}

export interface MySnackbarAction extends Partial<MySnackbarState> {
  type: string;
}

export const snackbarInitialState: MySnackbarState = {
  snackbarVisible: false,
  sideEffect: undefined,
  message: '',
  snackbarType: 'default',
  duration: 3000,
};

export const snackbarReducer = (state: MySnackbarState, action: StoreAction) => {
  switch (action.type) {
    case OPEN_SNACKBAR:
      return {
        snackbarVisible: true,
        message: action.message,
        sideEffect: action.sideEffect,
        snackbarType: action.snackbarType,
        duration: action.duration || state.duration,
      };
    case CLOSE_SNACKBAR:
      return snackbarInitialState;
    default:
      return state;
  }
};

const MySnackbar = (props: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  const {
    snackbarState: { snackbarVisible, sideEffect, message, snackbarType, duration },
    dispatch,
  } = props;

  const _handleAction = () => {
    if (sideEffect !== undefined) {
      sideEffect();
    }
    dispatch({ type: 'closeSnackbar' });
  };

  const buttonColor = getThemeColor(
    'accent',
    appearance === AppearanceType.LIGHT ? AppearanceType.DARK : AppearanceType.LIGHT,
  );
  return (
    <Snackbar
      visible={snackbarVisible}
      onDismiss={_handleAction}
      action={{
        label: '확인',
        onPress: _handleAction,
      }}
      duration={duration}
      style={styles.container}
      textStyle={styles.textStyle}
      buttonTextStyle={styles.buttonTextStyle}
      buttonColor={buttonColor}
    >
      {message}
    </Snackbar>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      zIndex: 0,
      elevation: 200,
      backgroundColor: getThemeColor('snackbar', appearance),
    },
    textStyle: {
      color: getThemeColor('background', appearance),
      fontWeight: '600',
      // ('text', appearance === AppearanceType.LIGHT ? AppearanceType.DARK : AppearanceType.LIGHT),
    },
    buttonTextStyle: {
      color: getThemeColor('accent', appearance === AppearanceType.LIGHT ? AppearanceType.DARK : AppearanceType.LIGHT),
    },
  });

export default memo(MySnackbar);
