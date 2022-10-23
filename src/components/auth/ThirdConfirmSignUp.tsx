import * as Yup from 'yup';

import { Dialog } from 'react-native-paper';
import { Formik, FormikValues } from 'formik';
import { Keyboard, Platform, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useEffect, useState } from 'react';
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
import { RESET_AUTH_STORE } from '../../stores/actionTypes';
import ResetFormButton from '../ResetFormButton';
import Right from '../Right';
import SingeLineInputField from '../SingleLineInputField';
import SwitchStackHeader from '../SwitchStackHeader';

import getThirdPartyName from '../../functions/getThirdPartyName';
import kakaoPw from '../../configs/kakaoPw';
import postAuthenticated from '../../functions/postAuthenticated';
import reportSentry from '../../functions/reportSentry';

import { withNextInputAutoFocusForm } from 'react-native-formik';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';
import MyDialogTitle from '../MyDialogTitle';

const Form = withNextInputAutoFocusForm(View);

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required('필수 입력입니다')
    .length(6, '인증 코드는 6자리 입니다')
    .matches(/^[0-9]+$/, '숫자만 입력해 주세요'),
});

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const ThirdPartyConfirmSignUp = ({ snackbarDispatch, navigation }: Props) => {
  const [visible, setVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [resendVisible, setResendVisible] = useState(false);
  const [notVerifiedVisible, setNotVerifiedVisible] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);

  const {
    authStore: { authInfo, appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);
  const nameOfThirdParty = getThirdPartyName(authInfo.username!);
  const storeDispatch = useStoreDispatch();

  useEffect(() => {
    if (authInfo.email === undefined) {
      setNotVerifiedVisible(true);
      Keyboard.dismiss();
    }
  }, []);

  const _handleSignIn = async () => {
    Keyboard.dismiss();
    let thirdPartyUserId = '';
    if (authInfo.username) {
      thirdPartyUserId = authInfo.username;
    } else if (authInfo.thirdPartyId !== undefined) {
      thirdPartyUserId =
        nameOfThirdParty === '카카오' ? `Kakao_${authInfo.thirdPartyId.id}` : `Apple_${authInfo.thirdPartyId.id}`;
    }

    try {
      setSignInLoading(true);
      const user = await Auth.signIn(thirdPartyUserId, kakaoPw);
      const { identityId } = await Auth.currentCredentials();

      await postAuthenticated(user, identityId, storeDispatch, appearance);
    } catch (e) {
      reportSentry(e);
      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: e.message,
        sideEffect: () => setSignInLoading(false),
        snackbarType: 'error',
      });
    }
  };

  const handleSubmit = async (
    values: FormikValues,
    resetForm: (nextValues?: { values: { username: string; code: string; email: string } }) => void,
  ) => {
    Keyboard.dismiss();
    try {
      await Auth.confirmSignUp(values.username, values.code);
      setVisible(true);
    } catch (e) {
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

  return (
    <>
      {renderHeader()}
      <AuthContainer subHeadline="이메일로 인증코드를 발송하였습니다. 확인 후 진행하세요">
        <Formik
          validateOnChange={true}
          validateOnBlur={true}
          validateOnMount={true}
          initialValues={{
            username: authInfo.username !== undefined ? authInfo.username : '',
            email: authInfo.email !== undefined ? authInfo.email : '',
            code: '',
          }}
          onSubmit={(values, action) => handleSubmit(values, action.resetForm)}
          validationSchema={validationSchema}
        >
          {props => {
            const noError: Boolean = Object.entries(props.errors).length === 0;

            return (
              <Form style={compStyles.form}>
                <View style={compStyles.authTopSpace} />

                {props.values.email !== '' && (
                  <>
                    <SingeLineInputField
                      editable={false}
                      labelText="이메일"
                      name="email"
                      type="email"
                      style={compStyles.disabledInput}
                    />
                    <AndroidDivider needMarginVertical />
                  </>
                )}

                <SingeLineInputField
                  labelText="인증 코드"
                  placeholder="이메일로 발송된 인증 코드를 입력하세요"
                  name="code"
                  keyboardType="numeric"
                  type="string"
                  clearButtonMode="while-editing"
                  textContentType="oneTimeCode"
                />
                <View style={compStyles.flex1} />

                <View style={compStyles.multiItemsInARow}>
                  <ThemedButton onPress={handleResend} mode="text">
                    인증 코드 재발송 요청
                  </ThemedButton>
                </View>

                <View style={compStyles.pressButtonsInARow}>
                  {Platform.OS === 'android' && (
                    <ResetFormButton
                      onPress={() =>
                        props.resetForm({
                          values: { username: props.values.username, code: '', email: props.values.username },
                        })
                      }
                    />
                  )}
                  <NextProcessButton
                    containerStyle={compStyles.flex1}
                    onPress={props.handleSubmit}
                    mode="contained"
                    children="인증하기"
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

      <MyDialogContainer
        visible={resendVisible}
        onDismiss={() => {
          setResendVisible(false);
        }}
      >
        <MyDialogTitle>인증 코드 재발송 완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="인증 코드가 재발송되었습니다." />
          <DialogContentText text="확인 후 입력하세요." />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={() => setResendVisible(false)}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <MyDialogContainer
        visible={notVerifiedVisible}
        onDismiss={() => {
          setNotVerifiedVisible(false);
        }}
      >
        <MyDialogTitle>{nameOfThirdParty} 이메일 인증 미완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="이메일 인증을 완료하셔야 로그인 가능합니다." />
          <DialogContentText text="이전에 입력하신 이메일로 인증 코드가 발송되었으니 확인 후 입력하세요" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={() => setNotVerifiedVisible(false)}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <MyDialogContainer
        visible={visible}
        onDismiss={() => {
          setVisible(false);
        }}
        dismissable={false}
      >
        <MyDialogTitle>인증 완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text={`${nameOfThirdParty} 이메일 인증이 완료되었습니다`} />
          <DialogContentText
            text={`이후 ${nameOfThirdParty} 로그인으로 로그인하실 수 있습니다. 확인을 누르시면 자동으로 로그인합니다. 잠시만 기다리세요`}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleSignIn} loading={signInLoading}>
            확인
          </ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <MyDialogContainer
        visible={cancelVisible}
        onDismiss={() => {
          setCancelVisible(false);
        }}
        dismissable={true}
      >
        <MyDialogTitle>{nameOfThirdParty} 이메일 인증 중단</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="중단하시면 다음 로그인 시 다시 시도하셔야 합니다." />
          <DialogContentText text="그래도 중단하시겠습니까?" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={() => setCancelVisible(false)}>계속하기</ThemedButton>
          <ThemedButton
            onPress={() => {
              storeDispatch({ type: RESET_AUTH_STORE });
              navigation.navigate((authInfo && authInfo.origin) || 'Home');
            }}
            color={theme.colors.accent}
          >
            중단하기
          </ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default withNavigation(ThirdPartyConfirmSignUp);
