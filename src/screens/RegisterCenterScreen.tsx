import { ConfirmCenter, NewAddressCenter, NewAddressConfirmCenter, NewCenter, SearchCenter } from '../components/registerCenter';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { memo, useReducer, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import CancelDialog from '../components/CancelDialog';
import { CenterStoreType } from '../types/store';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import { RESET_CENTER_STATE } from '../stores/actionTypes';
import useHandleAndroidBack from '../functions/handleAndroidBack';

interface Props extends NavigationStackScreenProps {}

const RegisterCenterScreen = ({ navigation }: Props) => {
  const [cancelVisible, setCancelVisible] = useState(false);

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const {
    centerStore,
    authStore: { appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  useHandleAndroidBack(navigation, () => setCancelVisible(true));

  const renderComponent = (centerStore: CenterStoreType) => {
    switch (centerStore.registerCenterState) {
      case 'init':
      case 'searchCenter':
        return <SearchCenter snackbarDispatch={snackbarDispatch} />;
      case 'confirmCenter':
        return <ConfirmCenter snackbarDispatch={snackbarDispatch} setCancelVisible={setCancelVisible} />;
      case 'newCenter':
        return <NewCenter cancelVisible={cancelVisible} setCancelVisible={setCancelVisible} />;
      case 'newAddressCenter':
        return <NewAddressCenter setCancelVisible={setCancelVisible} />;
      case 'newAddressConfirmCenter':
        return <NewAddressConfirmCenter snackbarDispatch={snackbarDispatch} setCancelVisible={setCancelVisible} />;
      default:
        return null;
    }
  };

  const _handleOnCancel = () => {
    storeDispatch({ type: RESET_CENTER_STATE });
    navigation.navigate(centerStore.origin);
  };

  return (
    <ModalScreenContainer
      children1={renderComponent(centerStore)}
      children2={
        <>
          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
          <CancelDialog
            cancelVisible={cancelVisible}
            setCancelVisible={setCancelVisible}
            onCancel={_handleOnCancel}
            title="마이센터 추가 중단"
            appearance={appearance}
          />
        </>
      }
    />
  );
};

export default memo(RegisterCenterScreen);
