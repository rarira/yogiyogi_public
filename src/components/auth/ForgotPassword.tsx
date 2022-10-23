import * as Yup from 'yup';

import { Dialog } from 'react-native-paper';
import { Formik, FormikValues } from 'formik';
import { Keyboard, Platform, ScrollView, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import React, { useState } from 'react';

import Auth from '@aws-amplify/auth';
import AuthContainer from './AuthContainer';
import { AuthInfoType } from '../../types/store';
import BackButton from '../BackButton';
import { CHANGE_AUTH_STATE } from '../../stores/actionTypes';
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
import { useStoreDispatch, useStoreState } from '../../stores/initStore';
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
});

interface Props {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const ForgotPassword = ({ snackbarDispatch }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const compStyles = getCompStyles(appearance);

  const [visible, setVisible] = useState(false);
  const [authInfo, setAuthInfo] = useState<AuthInfoType>({});
  const storeDispatch = useStoreDispatch();

  const handleSubmit = async (
    values: FormikValues,
    resetForm: (nextValues?: { values: { username: string } }) => void,
  ) => {
    Keyboard.dismiss();
    try {
      setAuthInfo({ username: values.username });
      const data = await Auth.forgotPassword(values.username);
      setVisible(true);
    } catch (e) {
      //OPTION: error handling : https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ForgotPassword.html

      switch (e.code) {
        case 'UserNotFoundException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '사용자가 존재하지 않습니다. ID를 확인하세요',
            sideEffect: () => resetForm({ values: { username: '' } }),
            snackbarType: 'error',
          });
          return;
        case 'TooManyRequestsException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '너무 많은 시도, 잠시 후 다시 시도하세요',
            // sideEffect: () => resetForm(),
            sideEffect: () => resetForm({ values: { username: '' } }),

            snackbarType: 'error',
          });
          return;
        case 'LimitExceededException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '잠시 후에 다시 시도하세요',
            // sideEffect: () => resetForm(),
            sideEffect: () => resetForm({ values: { username: '' } }),

            snackbarType: 'error',
          });
          return;
        case 'NetworkError':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '네트워크 에러, 잠시 후에 다시 시도하세요',
            // sideEffect: () => resetForm(),
            sideEffect: () => resetForm({ values: { username: '' } }),

            snackbarType: 'error',
          });
          return;
        default:
          reportSentry(e);
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: e.message,
            sideEffect: () => resetForm({ values: { username: '' } }),
            snackbarType: 'error',
          });
          return;
      }
    }
  };

  const renderHeader = () => {
    const _handleBackButton = () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signIn' });
    return (
      <SwitchStackHeader appearance={appearance}>
        <Left>
          <BackButton onPress={_handleBackButton} text="로그인으로" />
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
  const _handleOnPress = () =>
    storeDispatch({
      type: CHANGE_AUTH_STATE,
      authState: 'forgotPasswordSubmit',
      authInfo: { username: authInfo.username },
    });

  return (
    <>
      {renderHeader()}
      <AuthContainer headline="비밀번호 분실" subHeadline="비밀번호 재설정을 위한 인증 코드를 보내드립니다">
        <Formik
          validateOnChange={true}
          validateOnBlur={true}
          validateOnMount={true}
          initialValues={{ username: authInfo.username !== undefined ? authInfo.username : '' }}
          onSubmit={(values, actions) => handleSubmit(values, actions.resetForm)}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleResetForm = () => props.resetForm({ values: { username: '' } });
            const noError: Boolean = Object.entries(props.errors).length === 0;

            return (
              <Form style={compStyles.form}>
                <View style={compStyles.authTopSpace} />

                <SingeLineInputField
                  labelText="사용자 ID"
                  name="username"
                  type="string"
                  placeholder="비밀번호를 분실한 사용자의 ID를 입력하세요"
                  clearButtonMode="while-editing"
                />
                <View style={compStyles.flex1} />

                <View style={compStyles.pressButtonsInARow}>
                  {Platform.OS === 'android' && <ResetFormButton onPress={_handleResetForm} />}
                  <NextProcessButton
                    containerStyle={compStyles.flex1}
                    onPress={props.handleSubmit}
                    children="인증 코드 요청"
                    marginHorizontalNeedless
                    disabled={!noError}
                    loading={props.isSubmitting || (props.isValidating && !props.errors)}
                  />
                </View>
              </Form>
            );
          }}
        </Formik>
      </AuthContainer>
      <MyDialogContainer visible={visible} onDismiss={_handleOnDismiss} dismissable={false}>
        <MyDialogTitle>인증 코드 발송 완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="비밀번호 재설정을 위한 인증 코드가 가입시 입력하신 이메일로 발송되었습니다." />
          <DialogContentText text="다음 화면에서 비밀번호를 재설정하세요" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleOnPress}>비밀번호 재설정</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default ForgotPassword;
