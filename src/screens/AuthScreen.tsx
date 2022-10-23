import {
  AppleSignUp,
  ConfirmSignUp,
  ForgotPassword,
  ForgotPasswordSubmit,
  KakaoSignUp,
  SignIn,
  SignUp,
  SignedIn,
  ThirdPartyConfirmSignUp,
} from '../components/auth';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { memo, useReducer, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import CancelDialog from '../components/CancelDialog';
import ChangePassword from '../components/auth/ChangePassword';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import { RESET_AUTH_STORE } from '../stores/actionTypes';
import useHandleAndroidBack from '../functions/handleAndroidBack';

interface Props extends NavigationStackScreenProps {}

const AuthScreen = ({ navigation }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [cancelVisible, setCancelVisible] = useState(false);
  const { authStore } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const origin = navigation.getParam('origin');

  useHandleAndroidBack(navigation, () => setCancelVisible(true));

  const renderAuthComponent = () => {
    switch (authStore.authState) {
      case 'notAuthenticated':
      case 'signIn':
        return <SignIn snackbarDispatch={snackbarDispatch} />;
      case 'signUp':
        return <SignUp snackbarDispatch={snackbarDispatch} />;

      case 'confirmSignUp':
        return <ConfirmSignUp snackbarDispatch={snackbarDispatch} />;
      case 'kakaoSignUp':
        return <KakaoSignUp snackbarDispatch={snackbarDispatch} />;
      case 'appleSignUp':
        return <AppleSignUp snackbarDispatch={snackbarDispatch} />;
      case 'thirdPartyConfirmSignUp':
        return <ThirdPartyConfirmSignUp snackbarDispatch={snackbarDispatch} />;
      case 'forgotPassword':
        return <ForgotPassword snackbarDispatch={snackbarDispatch} />;
      case 'forgotPasswordSubmit':
        return <ForgotPasswordSubmit snackbarDispatch={snackbarDispatch} />;
      case 'changePassword':
        return <ChangePassword snackbarDispatch={snackbarDispatch} />;
      case 'signedIn':
        return <SignedIn />;
      default:
        return null;
    }
  };

  const _handleOnCancel = () => {
    const navigationFunction = () =>
      navigation.navigate(
        origin || (authStore.authInfo && authStore.authInfo.origin) || 'Home',
        navigation.state.params,
      );
    storeDispatch({
      type: RESET_AUTH_STORE,
    });
    navigationFunction();
  };

  return (
    <ModalScreenContainer
      children1={renderAuthComponent()}
      children2={
        <>
          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
          <CancelDialog
            cancelVisible={cancelVisible}
            setCancelVisible={setCancelVisible}
            title="인증 작업 중단"
            description="모든 작업이 중단됩니다. 작업한 데이터는 모두 초기화됩니다."
            onCancel={_handleOnCancel}
            appearance={authStore.appearance}
          />
        </>
      }
    />
  );
};

export default memo(AuthScreen);
