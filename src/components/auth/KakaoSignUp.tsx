import * as Yup from 'yup';

import { Alert, Keyboard, Platform, StyleSheet, View } from 'react-native';
import { Avatar, Dialog, Text } from 'react-native-paper';
import { CHANGE_AUTH_STATE, RESET_AUTH_STORE } from '../../stores/actionTypes';
import { Formik, FormikValues } from 'formik';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useEffect, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import Auth from '@aws-amplify/auth';
import AuthContainer from './AuthContainer';
import { AuthInfoType } from '../../types/store';
import CancelButton from '../CancelButton';
import DialogContentText from '../DialogContentText';
import KeyboardDismissButton from '../KeyboardDismissButton';
import Left from '../Left';
import MyDialogContainer from '../MyDialogContainer';
import NextProcessButton from '../NextProcessButton';
import RNKakao from 'rn-kakao-login';
import ResetFormButton from '../ResetFormButton';
import Right from '../Right';
import SingeLineInputField from '../SingleLineInputField';
import { String } from 'aws-sdk/clients/signer';
import SwitchStackHeader from '../SwitchStackHeader';

import emailAliasCheck from '../../functions/emailAliasCheck';
import kakaoPw from '../../configs/kakaoPw';
import reportSentry from '../../functions/reportSentry';

import { withNextInputAutoFocusForm } from 'react-native-formik';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';
import MyDialogTitle from '../MyDialogTitle';

const Form = withNextInputAutoFocusForm(View);

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required('필수 입력입니다')
    .trim('공백 문자는 허용되지 않습니다')
    .strict(true)
    .email('올바른 이메일 주소가 아닙니다'),
});

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const KakaoSignUp = ({ snackbarDispatch, navigation }: Props) => {
  const [visible, setVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [emailVisible, setEmailVisible] = useState<boolean | null>(null);
  const [kakaoSignInVisible, setKakaoSignInVisible] = useState(false);

  const [authInfo, setAuthInfo] = useState<AuthInfoType>({});
  const {
    authStore: {
      authInfo: { thirdPartyId },
      appearance,
    },
  } = useStoreState();

  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const storeDispatch = useStoreDispatch();

  useEffect(() => {
    if (authInfo.handleSubmit && emailVisible === null) {
      setEmailVisible(true);
    }
  }, [authInfo]);

  useEffect(() => {
    // console.log(thirdPartyId);
    if (thirdPartyId.id !== undefined) {
      setKakaoSignInVisible(true);
    }
  }, [thirdPartyId.id]);

  const kakaoUserId = `Kakao_${thirdPartyId.id}`;
  const kakaoUserEmail = thirdPartyId.email !== undefined ? thirdPartyId.email : '';
  // console.log(authInfo, kakaoUserId, kakaoUserEmail, kakaoPw);

  const handleSubmit = async (
    values: FormikValues,
    resetForm: (nextValues?: { values: { email: String } }) => void,
  ) => {
    try {
      await emailAliasCheck(authInfo.email!);
      await Auth.signUp({
        username: kakaoUserId,
        password: kakaoPw,
        attributes: {
          email: authInfo.email!,
          ...(thirdPartyId.profileImage && { picture: thirdPartyId.profileImage }),
          ...(thirdPartyId.nickName && { name: thirdPartyId.nickName }),
          // identities: JSON.stringify(identities),
        },
      });

      setVisible(true);
      // * 개발용
      // setTimeout(() => setVisible(true), 500);
    } catch (e) {
      // console.log(e);
      switch (e.code) {
        case 'CodeDeliveryFailureException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '인증 코드 발송에 실패하였습니다. 잠시 후 다시 시도하세요',
            snackbarType: 'error',
            sideEffect: () => {
              setEmailVisible(null);
            },
          });
          return;
        case 'NotAuthorizedException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '같은 이메일 주소의 사용자가 이미 존재합니다',
            sideEffect: () => {
              resetForm({ values: { email: '' } });
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
            snackbarType: 'error',
            sideEffect: () => {
              setEmailVisible(null);
            },
          });

          return;
      }
    }
  };

  const kakaoLogout = async () => {
    try {
      const result = await RNKakao.logout();
      // console.log(result);
      storeDispatch({ type: RESET_AUTH_STORE });
      navigation.navigate((authInfo && authInfo.origin) || 'Home');
      return;
    } catch (e) {
      reportSentry(e);
      // console.log(e);
      Alert.alert(e.toString());
    }
  };

  const renderHeader = () => {
    const _handleCancelButton = () => {
      Keyboard.dismiss();
      setErrorVisible(true);
    };
    return (
      <SwitchStackHeader appearance={appearance}>
        <Left>
          <CancelButton onPress={_handleCancelButton} />
        </Left>
        <Right>
          <KeyboardDismissButton />
        </Right>
      </SwitchStackHeader>
    );
  };

  const _handleKakaoSignInOnDismiss = () => {
    setKakaoSignInVisible(false);
  };
  const _handleErrorOnDismiss = () => {
    setErrorVisible(false);
  };
  const _handleVisibleOnDismiss = () => {
    setVisible(false);
  };
  const _handleEmailOnDismiss = () => {
    setEmailVisible(null);
  };
  const _handleCodeOnPress = () =>
    storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'thirdPartyConfirmSignUp', authInfo });
  const _handleEmailOnPress = () => {
    setEmailVisible(false);
    authInfo.handleSubmit();
  };
  return (
    <>
      {renderHeader()}
      <AuthContainer
        headline="카카오 이메일 인증"
        subHeadline="정상적인 사용을 위해 이메일 주소가 필요합니다. 카카오 계정과 연동된 이메일 주소와 달라도 상관없습니다."
      >
        <Formik
          validateOnChange={true}
          validateOnBlur={true}
          validateOnMount={true}
          initialValues={{ email: kakaoUserEmail }}
          onSubmit={(values, action) => handleSubmit(values, action.resetForm)}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleResetForm = () => props.resetForm({ values: { email: '' } });
            const _handleNextProcess = () => {
              Keyboard.dismiss();
              setAuthInfo({
                username: kakaoUserId,
                email: props.values.email,
                handleSubmit: props.handleSubmit,
              });

              // setEmailVisible(true);
            };

            const noError: Boolean = Object.entries(props.errors).length === 0;

            return (
              <Form style={compStyles.form}>
                <View style={compStyles.authTopSpace} />

                <SingeLineInputField
                  labelText="이메일"
                  name="email"
                  type="email"
                  value={props.values.email}
                  clearButtonMode="while-editing"
                />
                <View style={compStyles.flex1} />

                <View style={compStyles.pressButtonsInARow}>
                  {Platform.OS === 'android' && <ResetFormButton onPress={_handleResetForm} />}
                  <NextProcessButton
                    containerStyle={compStyles.flex1}
                    onPress={_handleNextProcess}
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

      <MyDialogContainer
        visible={kakaoSignInVisible}
        onDismiss={_handleKakaoSignInOnDismiss}
        dismissable={false}
        style={{ minHeight: 200 }}
      >
        <Dialog.Content style={styles.dialgoContentContainer}>
          {thirdPartyId.profileImage ? (
            <Avatar.Image size={64} source={{ uri: thirdPartyId.profileImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.kakaoNickName}>카카오톡 프로필 사진 없음</Text>
          )}
          <Text style={styles.kakaoNickName}>{thirdPartyId.nickName ?? '카카오톡 닉네임 없음'}</Text>
          <Text style={styles.dialogConfirmText}>본인이 맞으신가요?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={kakaoLogout} color={theme.colors.error}>
            아니오
          </ThemedButton>
          <ThemedButton onPress={_handleKakaoSignInOnDismiss}>예</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <MyDialogContainer visible={errorVisible} onDismiss={_handleErrorOnDismiss}>
        <MyDialogTitle>카카오 로그인 중단</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="카카오 로그인을 이용하지 않습니다." />
          <DialogContentText text="로그인 화면으로 돌아갑니다" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleErrorOnDismiss}>취소</ThemedButton>
          <ThemedButton onPress={kakaoLogout} color={theme.colors.accent}>
            로그인 돌아가기
          </ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <MyDialogContainer visible={visible} onDismiss={_handleVisibleOnDismiss} dismissable={false}>
        <MyDialogTitle>인증 코드 발송</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text={`이메일 인증을 위한 인증 코드가 ${authInfo.email}로 발송되었습니다.`} />
          <DialogContentText text="다음 화면에서 인증하십시오" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleCodeOnPress}>인증하기</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <MyDialogContainer visible={emailVisible === true} onDismiss={_handleEmailOnDismiss} dismissable={false}>
        <MyDialogTitle>이메일 확인 필요</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text={`입력하신 ${authInfo.email}이 본인의 이메일 주소가 맞습니까?`} bold />
          <DialogContentText text="이메일주소가 잘못 입력된 경우 이후 진행이 불가하여 재가입하셔야 합니다. 다시한번 확인해 주세요." />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton color={theme.colors.accent} onPress={_handleEmailOnDismiss}>
            재입력할게요
          </ThemedButton>
          <ThemedButton onPress={_handleEmailOnPress}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    dialgoContentContainer: { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    avatarImage: { marginVertical: 8, marginTop: 20 },
    kakaoNickName: { fontSize: theme.fontSize.normal, marginTop: 8, color: theme.colors.text },
    dialogConfirmText: { fontSize: theme.fontSize.small, color: theme.colors.backdrop, marginTop: 10 },
  });

export default withNavigation(KakaoSignUp);
