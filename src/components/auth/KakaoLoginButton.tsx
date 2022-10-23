import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RNKakao, { KakaoUser } from 'rn-kakao-login';
import React, { memo } from 'react';
import { getTheme, normalize } from '../../configs/theme';

import Auth from '@aws-amplify/auth';
import { CHANGE_AUTH_STATE } from '../../stores/actionTypes';
import { AppearanceType, TPartyUserInfoType } from '../../types/store';
import disconnectKakaoUser from '../../functions/disconnectKakaoUser';
import kakaoPw from '../../configs/kakaoPw';
import postAuthenticated from '../../functions/postAuthenticated';
import reportSentry from '../../functions/reportSentry';
import { useStoreDispatch } from '../../stores/initStore';

interface Props {
  setKakaoLoginStarted: (arg: boolean) => void;
  appearance: AppearanceType;
}

const KakaoLoginButton = ({ setKakaoLoginStarted, appearance }: Props) => {
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const kakaoLogin = async () => {
    let thirdPartyId: TPartyUserInfoType = { id: '' };
    let kakaoUserId = '';
    try {
      const result: KakaoUser = await RNKakao.login();
      setKakaoLoginStarted(true);

      kakaoUserId = `Kakao_${result.id}`;
      thirdPartyId = {
        id: result.id,
        nickName: result.nickname || undefined,
        email: result.email || undefined,
        profileImage: result.profileImage || undefined,
      };
      try {
        const user = await Auth.signIn(kakaoUserId, kakaoPw);

        const { identityId } = await Auth.currentCredentials();
        await postAuthenticated(user, identityId, storeDispatch, appearance);
      } catch (e) {
        // console.log(e);
        if (e.code === 'UserNotFoundException') {
          storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'kakaoSignUp', authInfo: { thirdPartyId } });
        } else if (e.code === 'UserNotConfirmedException') {
          await Auth.resendSignUp(kakaoUserId);
          storeDispatch({
            type: CHANGE_AUTH_STATE,
            authState: 'thirdPartyConfirmSignUp',
            authInfo: { username: kakaoUserId },
          });
        } else if (e.message === 'User is disabled.') {
          // console.log('kakao user disabled');
          await disconnectKakaoUser(result.accessToken);
          Alert.alert(
            '탈퇴한 계정',
            '탈퇴한 카카오 계정입니다. 재가입 불가하오니 이메일을 이용하여 새로 가입하세요',
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
      setKakaoLoginStarted(false);

      if (e.message === 'login error' || e.message.startsWith('Auth code 요청 중 뒤로가기')) {
        Alert.alert('카카오 로그인을 중단하셨습니다');
        // console.log(e);
      } else {
        reportSentry(e);
      }

      storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signIn' });
      return;
    }
  };

  return (
    <TouchableOpacity onPress={kakaoLogin} style={styles.kakaoButton}>
      <View style={styles.buttonInfo}>
        <Image source={require('../../static/img/kakaolink_btn_small.png')} style={styles.image} />
        <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
      </View>
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    image: { width: normalize(12), height: normalize(12), marginRight: theme.size.small },
    kakaoButton: {
      backgroundColor: '#ffeb00',
      marginBottom: theme.size.big,
      paddingVertical: theme.size.normal,
      height: normalize(30),
      borderRadius: 5,
    },
    buttonInfo: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    kakaoButtonText: { color: 'black', fontSize: theme.fontSize.normal, fontWeight: '600' },
  });

export default memo(KakaoLoginButton);
