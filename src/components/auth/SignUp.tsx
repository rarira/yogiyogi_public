import * as Yup from 'yup';

import { Dialog } from 'react-native-paper';
import { Formik, FormikValues } from 'formik';
import { Keyboard, Platform, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import React, { useEffect, useState } from 'react';

import AndroidDivider from '../AndroidDivider';
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
import { USER_NAME_LENGTH } from '../../configs/variables';

import emailAliasCheck from '../../functions/emailAliasCheck';
import reportSentry from '../../functions/reportSentry';

import { useStoreDispatch, useStoreState } from '../../stores/initStore';
import { withNextInputAutoFocusForm } from 'react-native-formik';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';
import MyDialogTitle from '../MyDialogTitle';

const Form = withNextInputAutoFocusForm(View);

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('필수 입력입니다')
    .trim('공백 문자는 허용되지 않습니다')
    .strict(true)
    .max(USER_NAME_LENGTH, '사용자 ID는 최대 10자입니다'),
  password: Yup.string()
    .required('필수 입력입니다')
    .trim('공백 문자는 허용되지 않습니다')
    .strict(true)
    .min(8, '비밀번호는 8자 이상입니다')
    .matches(/[a-z]/, '소문자가 포함되어야 합니다')
    .matches(/[A-Z]/, '대문자가 포함되어야 합니다')
    .matches(/[0-9]/, '숫자가 포함되어야 합니다')
    .matches(/^[a-zA-Z0-9]+$/, '영문 대/소문자, 숫자만 입력하세요'),
  // confirmPassword: Yup.string()
  //   .required('필수 입력입니다')
  //   .oneOf([Yup.ref('password'), null], '비밀번호와 일치하지 않습니다'),
  email: Yup.string()
    .required('필수 입력입니다')
    .trim('공백 문자는 허용되지 않습니다')
    .strict(true)
    .email('올바른 이메일 주소가 아닙니다'),
});

interface Props {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const SignUp = ({ snackbarDispatch }: Props) => {
  const [visible, setVisible] = useState(false);
  const [emailVisible, setEmailVisible] = useState<boolean | null>(null);
  const [authInfo, setAuthInfo] = useState<AuthInfoType>({});
  const storeDispatch = useStoreDispatch();

  const {
    authStore: { appearance },
  } = useStoreState();

  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  useEffect(() => {
    if (authInfo.handleSubmit && emailVisible === null) {
      setEmailVisible(true);
    }
  }, [authInfo]);

  // console.log(authInfo.handleSubmit, emailVisible);
  const handleSubmit = async (
    values: FormikValues,
    resetForm: (nextValues?: { values: { username: string; password: string; email: string } }) => void,
  ) => {
    try {
      await emailAliasCheck(authInfo.email!);
      await Auth.signUp({
        username: authInfo.username!,
        password: values.password,
        attributes: {
          email: authInfo.email!,
        },
      });
      setVisible(true);
    } catch (e) {
      //OPTION: error handling : https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_SignUp.html

      switch (e.code) {
        case 'NotAuthorizedException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '같은 이메일 주소의 사용자가 이미 존재합니다',
            sideEffect: () => {
              resetForm({
                values: {
                  username: authInfo.username!,
                  password: values.password,
                  // confirmPassword: values.confirmPassword,
                  email: '',
                },
              });
              setEmailVisible(null);
            },
            snackbarType: 'error',
          });
          return;
        case 'CodeDeliveryFailureException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '인증 코드 발송에 실패하였습니다. 잠시 후 다시 시도하세요',
            sideEffect: () => setEmailVisible(null),
            // sideEffect: () => resetForm({ username: values.username, code: '', password: values.password }),
            snackbarType: 'error',
          });
          return;
        case 'UsernameExistsException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '사용자 ID가 이미 존재합니다.',
            sideEffect: () => {
              resetForm({
                values: {
                  username: '',
                  password: values.password,
                  // confirmPassword: values.confirmPassword,
                  email: authInfo.email!,
                },
              });
              setEmailVisible(null);
            },
            snackbarType: 'error',
          });
          return;
        default:
          reportSentry(e);
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: e.message,
            sideEffect: () => {
              setEmailVisible(null);
            },
            snackbarType: 'error',
          });
          return;
      }
    }
  };

  // const renderEmailDialog = (handleSubmit: any) => (

  // );
  const renderHeader = () => (
    <SwitchStackHeader appearance={appearance}>
      <Left>
        <BackButton onPress={() => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signIn' })} text="로그인으로" />
      </Left>
      <Right>
        <KeyboardDismissButton />
      </Right>
    </SwitchStackHeader>
  );

  const _handleDialogDismiss = () => {
    setVisible(false);
  };
  const _handleEmailDismiss = () => {
    setEmailVisible(null);
  };

  const _handleDialogOnPress = () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'confirmSignUp', authInfo });
  const _handleEmailOnPress = () => {
    setEmailVisible(false);
    authInfo.handleSubmit();
  };
  return (
    <>
      {renderHeader()}
      <AuthContainer headline="가입하기">
        <Formik
          validateOnChange={true}
          validateOnBlur={true}
          validateOnMount={true}
          initialValues={{
            username: authInfo.username !== undefined ? authInfo.username : '',
            password: '',
            // confirmPassword: '',
            email: '',
          }}
          onSubmit={(values, action) => handleSubmit(values, action.resetForm)}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleSignUp = () => {
              Keyboard.dismiss();
              setAuthInfo({
                email: props.values.email,
                username: props.values.username,
                handleSubmit: props.handleSubmit,
              });

              // if (authInfo.handleSubmit) {
              //   setEmailVisible(true);
              // }
            };

            const noError: Boolean = Object.entries(props.errors).length === 0;
            return (
              <Form style={compStyles.form}>
                <View style={compStyles.authTopSpace} />

                <SingeLineInputField
                  labelText="사용자 ID"
                  name="username"
                  type="string"
                  clearButtonMode="while-editing"
                  placeholder="사용하실 ID를 입력하세요"
                  maxLength={USER_NAME_LENGTH}
                />
                <AndroidDivider needMarginVertical />

                <SingeLineInputField
                  labelText="비밀번호"
                  name="password"
                  type="password"
                  placeholder="최소 8자, 알파벳 대/소문자, 숫자 포함"
                  clearButtonMode="while-editing"
                />
                <AndroidDivider needMarginVertical />

                <SingeLineInputField
                  labelText="이메일"
                  placeholder="본인 소유의 이메일 주소를 입력하세요"
                  name="email"
                  type="email"
                  clearButtonMode="while-editing"
                />
                <View style={compStyles.flex1} />
                <View style={compStyles.pressButtonsInARow}>
                  {Platform.OS === 'android' && (
                    <ResetFormButton
                      onPress={() => props.resetForm({ values: { username: '', password: '', email: '' } })}
                    />
                  )}
                  <NextProcessButton
                    containerStyle={compStyles.flex1}
                    onPress={_handleSignUp}
                    disabled={!noError}
                    children="인증 코드 요청"
                    marginHorizontalNeedless
                    loading={props.isSubmitting || (props.isValidating && !props.errors)}
                  />
                </View>
              </Form>
            );
          }}
        </Formik>
      </AuthContainer>
      <MyDialogContainer visible={visible} onDismiss={_handleDialogDismiss} dismissable={false}>
        <MyDialogTitle>이메일 인증 필요</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text={`이메일 인증을 위한 인증 코드가 ${authInfo.email}로 발송되었습니다.`} />
          <DialogContentText text="다음 화면에서 인증하십시오" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleDialogOnPress}>인증하기</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
      <MyDialogContainer visible={emailVisible === true} onDismiss={_handleEmailDismiss} dismissable={true}>
        <MyDialogTitle>이메일 확인 필요</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text={`입력하신 ${authInfo.email}이 본인의 이메일 주소가 맞습니까?`} bold />
          <DialogContentText text="이메일주소가 잘못 입력된 경우 이후 진행이 불가하여 재가입하셔야 합니다. 다시한번 확인해 주세요." />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton color={theme.colors.accent} onPress={_handleEmailDismiss}>
            재입력할게요
          </ThemedButton>
          <ThemedButton onPress={_handleEmailOnPress}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default SignUp;
