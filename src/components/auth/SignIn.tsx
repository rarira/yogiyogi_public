import * as Yup from 'yup';

import { Dialog } from 'react-native-paper';
import { Formik, FormikValues } from 'formik';
import { Keyboard, Platform, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AndroidDivider from '../AndroidDivider';
import AppleLoginButton from './AppleLoginButton';
import Auth from '@aws-amplify/auth';
import AuthContainer from './AuthContainer';
import BackButton from '../BackButton';
import { CHANGE_AUTH_STATE } from '../../stores/actionTypes';
import DialogContentText from '../DialogContentText';
import KakaoLoginButton from './KakaoLoginButton';
import KeyboardDismissButton from '../KeyboardDismissButton';
import Left from '../Left';
import Loading from '../Loading';
import MyDialogContainer from '../MyDialogContainer';
import NextProcessButton from '../NextProcessButton';
import ResetFormButton from '../ResetFormButton';
import Right from '../Right';
import SingeLineInputField from '../SingleLineInputField';
import SwitchStackHeader from '../SwitchStackHeader';
import appleAuth from '@invertase/react-native-apple-authentication';

// import { isAvailableAsync } from 'expo-apple-authentication';
import postAuthenticated from '../../functions/postAuthenticated';
import reportSentry from '../../functions/reportSentry';
// import theme from '../../configs/theme';
import { withNextInputAutoFocusForm } from 'react-native-formik';
import { getCompStyles } from '../../configs/compStyles';
import ThemedButton from '../ThemedButton';
import MyDialogTitle from '../MyDialogTitle';

const Form = withNextInputAutoFocusForm(View);

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('필수 입력입니다')
    .trim('공백 문자는 허용되지 않습니다')
    .strict(true),
  password: Yup.string()
    .required('필수 입력입니다')
    .trim('공백 문자는 허용되지 않습니다')
    .strict(true)
    .min(8, '비밀번호는 8자 이상입니다')
    .matches(/[a-z]/, '소문자가 포함되어야 합니다')
    .matches(/[A-Z]/, '대문자가 포함되어야 합니다')
    .matches(/[0-9]/, '숫자가 포함되어야 합니다')
    .matches(/^[a-zA-Z0-9]+$/, '영문 대/소문자, 숫자만 입력하세요'),
});

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const SignIn = ({ snackbarDispatch, navigation }: Props) => {
  const [visible, setVisible] = useState(false);
  // const [appleAuthAvailable, setAppleAuthAvailable] = useState(appleAuth.isSignUpButtonSupported);
  const [loginStarted, setLoginStarted] = useState(false);
  const [signInInfo, setSignInInfo] = useState({ username: '' });
  const {
    authStore: { authInfo, appearance },
  } = useStoreState();

  const appleAuthAvailable = appleAuth.isSignUpButtonSupported;

  const compStyles = getCompStyles(appearance);
  const storeDispatch = useStoreDispatch();

  // useEffect(() => {
  //   let _mounted = true;
  //   if (_mounted) {
  //     (async function() {
  //       try {
  //         const bool = appleAuth.isSignUpButtonSupported;
  //         if (bool) {
  //           setAppleAuthAvailable(bool);
  //         }
  //       } catch (e) {
  //         reportSentry(e);
  //       }
  //     })();
  //   }
  //   return () => {
  //     _mounted = false;
  //   };
  // }, []);

  const origin = navigation.getParam('origin');

  const _handleBackButton = () => {
    navigation.navigate(origin || (authInfo && authInfo.origin) || 'Home', navigation.state.params);
  };

  const handleSubmit = async (values: FormikValues, resetForm: (nextValues?: { values: { username: string; password: string } }) => void) => {
    Keyboard.dismiss();

    setSignInInfo({ username: values.username });
    const _handleResetForm = () => resetForm({ values: { username: '', password: '' } });
    setLoginStarted(true);
    try {
      const user = await Auth.signIn(values.username, values.password);
      const { identityId } = await Auth.currentCredentials();

      await postAuthenticated(user, identityId, storeDispatch, appearance);
    } catch (e) {
      setLoginStarted(false);
      switch (e.code) {
        case 'NotAuthorizedException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '잘못된 사용자 정보',
            sideEffect: _handleResetForm,
            snackbarType: 'error',
          });
          return;
        case 'UserNotConfirmedException':
          await Auth.resendSignUp(values.username);
          setVisible(true);
          return;
        case 'UserNotFoundException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '사용자를 찾을 수 없습니다.',
            sideEffect: _handleResetForm,
            snackbarType: 'error',
          });
          return;
        default:
          reportSentry(e);
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: e.message,
            // sideEffect: () => resetForm(),
            snackbarType: 'error',
          });
          return;
      }
    }
  };

  const renderHeader = () => (
    <SwitchStackHeader appearance={appearance}>
      <Left>
        <BackButton onPress={_handleBackButton} />
      </Left>

      <Right>
        <KeyboardDismissButton />
      </Right>
    </SwitchStackHeader>
  );

  const _handleDismiss = () => setVisible(false);
  const _handleConfirmSignUp = () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'confirmSignUp', authInfo: signInInfo });

  return (
    <>
      {loginStarted ? (
        <Loading auth={true} text="로그인 중입니다. 잠시만 기다리세요" origin="SignIn" />
      ) : (
        <>
          {renderHeader()}
          <AuthContainer headline="로그인">
            <>
              <Formik
                validateOnChange={true}
                validateOnBlur={true}
                validateOnMount={true}
                initialValues={{
                  username: authInfo && authInfo.username !== undefined ? authInfo.username : '',
                  password: '',
                }}
                onSubmit={(values, action) => handleSubmit(values, action.resetForm)}
                validationSchema={validationSchema}
              >
                {props => {
                  const _handleResetForm = () => props.resetForm({ values: { username: '', password: '' } });
                  const _handleNavToSignUp = () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signUp' });
                  const _handleNavToForgotPassword = () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'forgotPassword' });

                  const noError: Boolean = Object.entries(props.errors).length === 0;

                  return (
                    <Form style={compStyles.form}>
                      <View style={compStyles.authTopSpace} />
                      <SingeLineInputField
                        labelText="사용자 ID "
                        name="username"
                        type="string"
                        clearButtonMode="while-editing"
                        placeholder="사용자 ID를 입력하세요"
                        accessibilityLabel="idInput"
                        textContentType="username"
                        // style={{ borderColor: 'red', borderWidth: 1, padding: 0 }}
                      />
                      <AndroidDivider needMarginVertical />
                      <SingeLineInputField
                        labelText="비밀번호"
                        name="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        clearButtonMode="while-editing"
                        accessibilityLabel="passwordInput"
                        textContentType="password"
                      />
                      <View style={compStyles.flex1} />
                      <View style={compStyles.multiItemsInARow}>
                        <ThemedButton onPress={_handleNavToSignUp} mode="text">
                          가입하기
                        </ThemedButton>
                        <ThemedButton onPress={_handleNavToForgotPassword} mode="text">
                          비밀번호 분실
                        </ThemedButton>
                      </View>

                      <View style={compStyles.pressButtonsInARow}>
                        {Platform.OS === 'android' && <ResetFormButton onPress={_handleResetForm} />}
                        <NextProcessButton
                          containerStyle={compStyles.flex1}
                          onPress={props.handleSubmit}
                          mode="contained"
                          children="로그인"
                          marginHorizontalNeedless
                          accessibilityLabel="signInButton"
                          disabled={!noError}
                          loading={props.isSubmitting || (props.isValidating && !props.errors)}
                        />
                      </View>
                      {appleAuthAvailable && <AppleLoginButton setAppleLoginStarted={setLoginStarted} />}
                      <KakaoLoginButton setKakaoLoginStarted={setLoginStarted} appearance={appearance} />
                    </Form>
                  );
                }}
              </Formik>
            </>
          </AuthContainer>
        </>
      )}
      <MyDialogContainer visible={visible} onDismiss={_handleDismiss} dismissable={false}>
        <MyDialogTitle>이메일 인증 미완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="이메일 인증 미완료 상태에서는 이용이 불가합니다." />
          <DialogContentText text="다음 화면에서 인증을 완료하십시오" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleConfirmSignUp}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default withNavigation(SignIn);
