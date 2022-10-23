import { Dialog } from 'react-native-paper';
import { AppearanceType } from '../types/store';
import { getThemeColor } from '../configs/theme';
import React, { FunctionComponent } from 'react';
import { useStoreState } from '../stores/initStore';
import { StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  dismissable?: boolean;
  onDismiss?: () => any;
}

const MyDialogContainer: FunctionComponent<Props> = ({ children, ...rest }) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const backgroundColor =
    appearance === AppearanceType.LIGHT
      ? getThemeColor('background', appearance)
      : getThemeColor('uiBackground', appearance);

  return (
    <Dialog style={{ backgroundColor, borderColor: 'white', borderWidth: StyleSheet.hairlineWidth }} {...rest}>
      {children}
    </Dialog>
  );
};

export default MyDialogContainer;
