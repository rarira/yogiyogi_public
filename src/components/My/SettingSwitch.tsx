import React, { Dispatch, memo } from 'react';
import { SET_SETTINGS_STATE } from '../../functions/useSettingsState';

import { Switch } from 'react-native-paper';
import { getThemeColor } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  settingsDispatch: Dispatch<any>;
  status: boolean | null;
  value: string;
  appearance: AppearanceType;
}
const SettingSwitch = ({ settingsDispatch, status, value, appearance }: Props) => {
  const _handleOnValueChange = () => settingsDispatch({ type: SET_SETTINGS_STATE, [value]: !status, updated: true });
  if (status === null) {
    return null;
  }
  return <Switch value={status} onValueChange={_handleOnValueChange} color={getThemeColor('primary', appearance)} />;
};

export default memo(SettingSwitch);
