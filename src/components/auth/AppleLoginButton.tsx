import { Alert, StyleSheet } from 'react-native';
import React, { memo } from 'react';
// import * as AppleAuthentication from 'expo-apple-authentication';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import theme, { normalize } from '../../configs/theme';

import Auth from '@aws-amplify/auth';
import { CHANGE_AUTH_STATE } from '../../stores/actionTypes';
import { AppearanceType, TPartyUserInfoType } from '../../types/store';
import kakaoPw from '../../configs/kakaoPw';
import postAuthenticated from '../../functions/postAuthenticated';
import reportSentry from '../../functions/reportSentry';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';
import jwtDecode, { JwtPayload } from 'jwt-decode';

interface Props {
  setAppleLoginStarted: (arg: boolean) => void;
}

const AppleLoginButton = ({ setAppleLoginStarted }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const appleLogin = async () => {
    let thirdPartyId: TPartyUserInfoType = { id: '' };
    let appleUserId = '';
    let appleEmailFromJwtToken = '';
    let appleIsPrivateEmail = false;

    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // if(!!appleAuthRequestResponse.email) {
      const parsedJWT: JwtPayload = jwtDecode(appleAuthRequestResponse.identityToken!);
      appleEmailFromJwtToken = parsedJWT.email;
      appleIsPrivateEmail = parsedJWT.is_private_email;

      setAppleLoginStarted(true);

      // get current authentication state for user
      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
      // appleUserId = `Apple_${credential.user}`;
      // use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        // user is authenticated
        thirdPartyId = {
          id: appleAuthRequestResponse.user,
          nickName: appleAuthRequestResponse.fullName?.nickname || undefined,
          email: appleAuthRequestResponse.email || appleEmailFromJwtToken || undefined,
          profileImage: undefined,
          isPrivateEmail: appleIsPrivateEmail,
        };
        appleUserId = `Apple_${appleAuthRequestResponse.user}`;
      }
      try {
        const user = await Auth.signIn(appleUserId, kakaoPw);

        const { identityId } = await Auth.currentCredentials();
        await postAuthenticated(user, identityId, storeDispatch, appearance);
      } catch (e) {
        if (e.code === 'ERR_CANCELLED') {
          Alert.alert('애플 로그인 중단', '로그인 화면으로 돌아갑니다', [
            {
              text: '확인',
              onPress: () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signIn' }),
            },
          ]);
        } else if (
          e.code === 'ERR_APPLE_AUTHENTICATION_CREDENTIAL' ||
          e.code === 'ERR_APPLE_AUTHENTICATION_REQUEST_FAILED' ||
          e.code === 'ERR_APPLE_AUTHENTICATION_UNAVAILABLE'
        ) {
          reportSentry(e);
          Alert.alert('애플 로그인 실패', '애플 로그인을 실행할 수 없습니다. 다른 로그인 방법을 이용하세요', [
            {
              text: '확인',
              onPress: () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signIn' }),
            },
          ]);
        } else if (e.code === 'UserNotFoundException') {
          storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'appleSignUp', authInfo: { thirdPartyId } });
        } else if (e.code === 'UserNotConfirmedException') {
          await Auth.resendSignUp(appleUserId);
          storeDispatch({
            type: CHANGE_AUTH_STATE,
            authState: 'thirdPartyConfirmSignUp',
            authInfo: { username: appleUserId },
          });
        } else if (e.message === 'User is disabled.') {
          // await disconnectKakaoUser(credential.accessToken);
          Alert.alert(
            '탈퇴한 계정',
            '탈퇴한 애플 계정입니다. 재가입 불가하오니 이메일을 이용하여 새로 가입하세요',
            [
              {
                text: '취소',
                onPress: () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signIn' }),
                style: 'cancel',
              },
              {
                text: '신규 가입',
                onPress: () => storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signUp' }),
              },
            ],
            { cancelable: false },
          );
        } else {
          throw e;
        }
      }
    } catch (e) {
      setAppleLoginStarted(false);

      reportSentry(e);
      Alert.alert(e.message);

      storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signIn' });
      return;
    }
  };

  // console.log(AppleAuthentication);
  const buttonColor = appearance === AppearanceType.LIGHT ? AppleButton.Style.BLACK : AppleButton.Style.WHITE;
  return (
    <AppleButton
      buttonType={AppleButton.Type.SIGN_IN}
      buttonStyle={buttonColor}
      // cornerRadius={5}
      style={styles.appleButton}
      onPress={appleLogin}
    />
  );
};

const styles = StyleSheet.create({
  appleButton: {
    width: '100%',
    height: normalize(30),
    marginBottom: theme.size.small,
  },
  buttonInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(AppleLoginButton);
