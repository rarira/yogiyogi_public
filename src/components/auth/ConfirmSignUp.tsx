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
import theme, { getThemeColor } from '../../configs/theme';
import { withNextInputAutoFocusForm } from 'react-native-formik';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import MyDialogTitle from '../MyDialogTitle';

const Form = withNextInputAutoFocusForm(View);

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required('필수 입력입니다')
    .length(6, '인증 코드는 6자리 입니다')
    .matches(/^[0-9]+$/, '숫자만 입력하세요'),
});

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const ConfirmSignUp = ({ snackbarDispatch, navigation }: Props) => {
  const [visible, setVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [resendVisible, setResendVisible] = useState(false);
  const { authStore } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const { authInfo, appearance } = authStore;
  const compStyles = getCompStyles(appearance);

  const handleSubmit = async (
    values: FormikValues,
    resetForm: (nextValues?: { values: { username: string; code: string; email: string } }) => void,
  ) => {
    Keyboard.dismiss();
    try {
      await Auth.confirmSignUp(values.username, values.code, { forceAliasCreation: false });
      setVisible(true);
    } catch (e) {
      //OPTION: error code : https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ConfirmSignUp.html
      switch (e.code) {
        case 'CodeMismatchException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '인증 코드가 틀립니다',
            sideEffect: () => resetForm({ values: { username: values.username, code: '', email: values.email } }),
            snackbarType: 'error',
          });
          return;
        case 'ExpiredCodeException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '인증 코드 유효기간 24시간이 지났습니다',
            sideEffect: () => resetForm({ values: { username: values.username, code: '', email: values.email } }),
            snackbarType: 'error',
          });
          return;
        case 'AliasExistsException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '같은 이메일이 존재합니다',
            sideEffect: () => resetForm({ values: { username: values.username, code: '', email: '' } }),
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
            // duration: 3000,
          });
          return;
      }
    }
  };

  const handleResend = async () => {
    Keyboard.dismiss();
    try {
      if (authInfo.username !== undefined) {
        await Auth.resendSignUp(authInfo.username);

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
        case 'LimitExceededException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '인증 코드 발송 한도 초과. 잠시 후 다시 시도하세요',
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

  const _handleEmailOnPress = () => {
    storeDispatch({ type: RESET_AUTH_STORE });
    navigation.navigate((authInfo && authInfo.origin) || 'Home');
  };
  const _handleConfirmOnPress = () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signIn', authInfo });
  const _handleCancelOnDismiss = () => {
    setCancelVisible(false);
  };
  const _handleVisibleOnDismiss = () => {
    setVisible(false);
  };
  const _handleResendOnDismiss = () => setResendVisible(false);

  return (
    <>
      {renderHeader()}
      <AuthContainer subHeadline="이메일로 인증코드를 발송하였습니다. 확인 후 진행하세요">
        <Formik
          validateOnChange={true}
          validateOnBlur={true}
          validateOnMount={true}
          initialValues={{
            username: authInfo && authInfo.username !== undefined ? authInfo.username : '',
            email: authInfo && authInfo.email !== undefined ? authInfo.email : '',
            code: '',
          }}
          onSubmit={(values, action) => handleSubmit(values, action.resetForm)}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleResetForm = () =>
              props.resetForm({ values: { username: props.values.username, code: '', email: props.values.email } });
            const noError: Boolean = Object.entries(props.errors).length === 0;

            return (
              <Form style={compStyles.form}>
                <View style={compStyles.authTopSpace} />

                <SingeLineInputField
                  editable={false}
                  labelText="사용자 ID"
                  name="username"
                  type="string"
                  value={props.values.username}
                  style={compStyles.disabledInput}
                />
                {props.values.email !== '' && (
                  <SingeLineInputField
                    editable={false}
                    labelText="이메일"
                    name="email"
                    type="email"
                    style={compStyles.disabledInput}
                  />
                )}
                <AndroidDivider needMarginVertical />

                <SingeLineInputField
                  labelText="인증 코드"
                  name="code"
                  keyboardType="numeric"
                  type="string"
                  clearButtonMode="while-editing"
                  placeholder="이메일로 발송된 인증 코드를 입력하세요"
                  textContentType="oneTimeCode"
                />
                <View style={compStyles.multiItemsInARow}>
                  <ThemedButton onPress={handleResend} mode="text">
                    인증 코드 재발송 요청
                  </ThemedButton>
                </View>
                <View style={compStyles.flex1} />

                <View style={compStyles.pressButtonsInARow}>
                  {Platform.OS === 'android' && <ResetFormButton onPress={_handleResetForm} />}

                  <NextProcessButton
                    containerStyle={compStyles.flex1}
                    mode="contained"
                    onPress={props.handleSubmit}
                    children="인증하기"
                    disabled={!noError}
                    marginHorizontalNeedless
                    loading={props.isSubmitting || (props.isValidating && !props.errors)}
                  />
                </View>
              </Form>
            );
          }}
        </Formik>
      </AuthContainer>

      <MyDialogContainer visible={resendVisible} onDismiss={_handleResendOnDismiss}>
        <MyDialogTitle>인증 코드 재발송 완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText
            text={`인증 코드가 ${authInfo?.email ? authInfo.email : '가입시 입력한 이메일 주소'}로 재발송되었습니다.`}
          />
          <DialogContentText text="확인 후 입력하세요" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleResendOnDismiss}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <MyDialogContainer visible={visible} onDismiss={_handleVisibleOnDismiss} dismissable={false}>
        <MyDialogTitle>가입 완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="가입이 완료되었습니다." />
          <DialogContentText text="다음 화면에서 로그인하십시오" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleConfirmOnPress}>로그인하기</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <MyDialogContainer visible={cancelVisible} onDismiss={_handleCancelOnDismiss} dismissable={true}>
        <MyDialogTitle>이메일 인증 중단</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="중단하시면 다음 로그인 시 다시 시도하셔야 합니다." />
          <DialogContentText text="그래도 중단하시겠습니까?" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleCancelOnDismiss}>계속하기</ThemedButton>
          <ThemedButton onPress={_handleEmailOnPress} color={getThemeColor('accent', appearance)}>
            중단하기
          </ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default withNavigation(ConfirmSignUp);
