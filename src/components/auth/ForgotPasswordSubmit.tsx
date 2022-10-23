import * as Yup from 'yup';

import { Dialog } from 'react-native-paper';
import { CHANGE_AUTH_STATE, RESET_AUTH_STORE } from '../../stores/actionTypes';
import { Formik, FormikValues } from 'formik';
import { Keyboard, Platform, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AndroidDivider from '../AndroidDivider';
import Auth from '@aws-amplify/auth';
import AuthContainer from './AuthContainer';
import CancelButton from '../CancelButton';
import CancelDialog from '../CancelDialog';
import DialogContentText from '../DialogContentText';
import KeyboardDismissButton from '../KeyboardDismissButton';
import Left from '../Left';
import MyDialogContainer from '../MyDialogContainer';
import NextProcessButton from '../NextProcessButton';
import ResetFormButton from '../ResetFormButton';
import Right from '../Right';
import SingeLineInputField from '../SingleLineInputField';
import SwitchStackHeader from '../SwitchStackHeader';

import reportSentry from '../../functions/reportSentry';
import { withNextInputAutoFocusForm } from 'react-native-formik';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
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
  code: Yup.string()
    .required('필수 입력입니다')
    .length(6, '인증 코드는 6자리 입니다')
    .matches(/^[0-9]+$/, '숫자만 입력하세요'),
});

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const ForgotPasswordSubmit = ({ snackbarDispatch, navigation }: Props) => {
  const [visible, setVisible] = useState(false);
  const [resendVisible, setResendVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);

  const { authStore } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const { authInfo, appearance } = authStore;
  const compStyles = getCompStyles(appearance);

  const handleSubmit = async (
    values: FormikValues,
    resetForm: (nextValues?: { values: { username: string; code: string; password: string } }) => void,
  ) => {
    Keyboard.dismiss();
    try {
      const data = await Auth.forgotPasswordSubmit(values.username, values.code, values.password);
      setVisible(true);
    } catch (e) {
      //OPTION: error code : https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ConfirmForgotPassword.html
      switch (e.code) {
        case 'CodeMismatchException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '인증 코드가 틀립니다',
            sideEffect: () => resetForm({ values: { username: values.username, code: '', password: values.password } }),
            snackbarType: 'error',
          });
          return;
        case 'ExpiredCodeException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '인증 코드 유효기간 1시간이 지났습니다',
            sideEffect: () => resetForm({ values: { username: values.username, code: '', password: values.password } }),
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

  const handleResend = async () => {
    Keyboard.dismiss();
    try {
      if (authInfo.username !== undefined) {
        // console.log(authInfo);
        await Auth.forgotPassword(authInfo.username);
        setResendVisible(true);
      }
    } catch (e) {
      switch (e.code) {
        case 'CodeDeliveryFailureException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '인증 코드 발송에 실패하였습니다. 잠시 후 다시 시도하세요',
            // sideEffect: () => resetForm({ username: values.username, code: '', password: values.password }),
            snackbarType: 'error',
          });
          return;
        case 'TooManyRequestsException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '너무 많은 시도, 잠시 후 다시 시도하세요',
            snackbarType: 'error',
          });
          return;
        case 'LimitExceededException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '인증 코드 발송 한도 초과. 잠시 후 다시 시도하세요',
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

  const renderHeader = () => {
    const _handleOnCancel = () => {
      Keyboard.dismiss();
      setCancelVisible(true);
    };
    return (
      <SwitchStackHeader appearance={appearance}>
        <Left>
          <CancelButton onPress={_handleOnCancel} />
        </Left>
        <Right>
          <KeyboardDismissButton />
        </Right>
      </SwitchStackHeader>
    );
  };

  const _handleOnDismiss = () => {
    setVisible(false);
  };
  const _handleResendVisible = () => setResendVisible(false);
  const _handleConfirm = () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signIn' });
  const _handleOnCancel = () => {
    storeDispatch({ type: RESET_AUTH_STORE });
    navigation.navigate((authInfo && authInfo.origin) || 'Home');
  };
  return (
    <>
      {renderHeader()}
      <AuthContainer headline="비밀번호 재설정">
        <Formik
          validateOnChange={true}
          validateOnBlur={true}
          validateOnMount={true}
          initialValues={{
            username: authInfo && authInfo.username !== undefined ? authInfo.username : '',
            code: '',
            password: '',
          }}
          onSubmit={(values, actions) => handleSubmit(values, actions.resetForm)}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleResetForm = () =>
              props.resetForm({ values: { username: props.values.username, code: '', password: '' } });
            const noError: Boolean = Object.entries(props.errors).length === 0;

            return (
              <Form style={compStyles.form}>
                <View style={compStyles.authTopSpace} />

                <SingeLineInputField
                  labelText="사용자 ID"
                  name="username"
                  type="string"
                  editable={false}
                  value={props.values.username}
                />
                <AndroidDivider needMarginVertical />

                <SingeLineInputField
                  labelText="인증 코드"
                  placeholder="이메일로 발송된 인증 코드를 입력하세요"
                  name="code"
                  keyboardType="numeric"
                  type="string"
                  textContentType="oneTimeCode"
                />
                <AndroidDivider needMarginVertical />

                <SingeLineInputField
                  labelText="새로운 비밀번호"
                  placeholder="최소 8자, 알파벳 대/소문자, 숫자 포함"
                  name="password"
                  type="password"
                  clearButtonMode="while-editing"
                />

                <View style={compStyles.flex1} />

                <View style={compStyles.multiItemsInARow}>
                  <ThemedButton onPress={handleResend} mode="text">
                    인증 코드 재발송 요청
                  </ThemedButton>
                </View>

                <View style={compStyles.pressButtonsInARow}>
                  {Platform.OS === 'android' && <ResetFormButton onPress={_handleResetForm} />}
                  <NextProcessButton
                    containerStyle={compStyles.flex1}
                    onPress={props.handleSubmit}
                    mode="contained"
                    disabled={!noError}
                    children="비밀번호 재설정"
                    marginHorizontalNeedless
                    loading={props.isSubmitting || (props.isValidating && !props.errors)}
                  />
                </View>
              </Form>
            );
          }}
        </Formik>
      </AuthContainer>

      <MyDialogContainer visible={resendVisible} onDismiss={_handleOnDismiss}>
        <MyDialogTitle>인증 코드 재발송 완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="인증 코드가 재발송되었습니다." />
          <DialogContentText text="확인 후 입력하세요" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleResendVisible}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <MyDialogContainer visible={visible} onDismiss={_handleOnDismiss} dismissable={false}>
        <MyDialogTitle>비밀번호 재설정 완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="비밀번호가 재설정되었습니다" />
          <DialogContentText text="다음 화면에서 로그인하세요" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleConfirm}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <CancelDialog
        title="비밀번호 재설정 중단"
        onCancel={_handleOnCancel}
        cancelVisible={cancelVisible}
        setCancelVisible={setCancelVisible}
        appearance={appearance}
      />
    </>
  );
};

export default withNavigation(ForgotPasswordSubmit);
