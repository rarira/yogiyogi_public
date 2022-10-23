import { Reducer, useReducer } from 'react';

import { PermissionStatus } from 'react-native';
import { boolean } from 'yup';

export interface SettingState {
  [key: string]: any;
  buildNumber: string;
  codePushVersion: string;
  updateAvailable: boolean;
  deviceInfo: string;
  optIn: boolean | null;
  messageOptIn: boolean | null;
  reviewOptIn: boolean | null;
  commOptIn: boolean | null;
  isFirstTime: boolean;
  privacyResume: boolean | null;
  privacyManners: boolean | null;
  updated: boolean;
  appNotiPermission: PermissionStatus | null;
}

const initialState: SettingState = {
  buildNumber: '',
  codePushVersion: '',
  updateAvailable: false,
  deviceInfo: '',
  optIn: null,
  messageOptIn: null,
  reviewOptIn: null,
  commOptIn: null,
  isFirstTime: true,
  privacyResume: null,
  privacyManners: null,
  updated: false,
  appNotiPermission: null,
};

export const SET_SETTINGS_STATE = 'setSettingsState';
export const SETTINGS_RESET = 'setSettingsReset';

const reducer: Reducer<any, any> = (state, action) => {
  const { type, ...others } = action;
  switch (type) {
    case SET_SETTINGS_STATE: {
      return {
        ...state,
        ...others,
      };
    }
    case SETTINGS_RESET:
      return initialState;
  }
};

const useSettingsState = () => {
  const [settingsState, settingsDispatch] = useReducer(reducer, initialState);
  return { settingsState, settingsDispatch };
};

export default useSettingsState;
