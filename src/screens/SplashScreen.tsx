import { NavigationFocusInjectedProps, withNavigationFocus } from 'react-navigation';
import React, { useEffect } from 'react';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import AsyncStorage from '@react-native-community/async-storage';
import Auth from '@aws-amplify/auth';
// import { BackHandler } from 'react-native';
import BackgroundJob from '../components/BackgroundJob';
import DeviceInfo from 'react-native-device-info';
import Loading from '../components/Loading';
import { SET_BOOKMARKS } from '../stores/actionTypes';
import postAuthenticated from '../functions/postAuthenticated';
import reportSentry from '../functions/reportSentry';
// import { useNetInfo } from '@react-native-community/netinfo';
import { getTheme } from '../configs/theme';
import { useColorScheme } from 'react-native';
import hideSplashScreen from '../functions/hideSplashScreen';

interface Props extends NavigationFocusInjectedProps {}

const SplashScreen = ({ navigation, isFocused }: Props) => {
  // const { isInternetReachable } = useNetInfo();
  const colorScheme = useColorScheme();
  const {
    authStore: { readyToServe, user, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  // const _handleBackButton = () => BackHandler.exitApp();

  // useHandleAndroidBack(navigation, _handleBackButton);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userInfo = await Auth.currentAuthenticatedUser();
        const { identityId } = await Auth.currentCredentials();
        if (userInfo.username.startsWith('Apple_')) {
          DeviceInfo.isEmulator().then(async isEmulator => {
            if (!isEmulator) {
              const appleUserString = userInfo.username.split('_')[1];
              const credentials = await appleAuth.getCredentialStateForUser(appleUserString);
              if (credentials !== appleAuth.State.AUTHORIZED) {
                throw Error(`애플 로그인 실패: ${userInfo.username}`);
              }
            }
          });
        }

        await postAuthenticated(userInfo, identityId, storeDispatch, colorScheme);
      } catch (e) {
        if (e.message !== 'not authenticated') {
          reportSentry(e);
        }
        const hearts = await AsyncStorage.getItem('guest_hearts');
        const postLikes = await AsyncStorage.getItem('guest_postLikes');
        const simpleSearchHistory = await AsyncStorage.getItem('guest_simpleSearchHistory');
        const detailSearchHistory = await AsyncStorage.getItem('guest_detailSearchHistory');
        const isOnBoardingFinished = await AsyncStorage.getItem('guest_isOnBoardingFinished');
        let isFirstTemp = await AsyncStorage.getItem('guest_isFirst');
        //TODO: 테스트 용 임시
        if (typeof isFirstTemp === 'boolean') {
          isFirstTemp = null;
        }
        const isFirst = isFirstTemp ? JSON.parse(isFirstTemp) : {};

        storeDispatch({
          type: SET_BOOKMARKS,
          bookmark: [],
          postBookmark: [],
          simpleSearchHistory: simpleSearchHistory ? JSON.parse(simpleSearchHistory) : [],
          detailSearchHistory: detailSearchHistory ? JSON.parse(detailSearchHistory) : [],
          isOnBoardingFinished: isOnBoardingFinished === 'true',
          hearts: hearts ? JSON.parse(hearts) : { count: 0, used: false },
          postLikes: postLikes ? JSON.parse(postLikes) : { count: 0, used: false },
          isFirst,
          isInternetReachable: true,
          readyToServe: true,
          appearance: colorScheme,
        });
        if (isFirst.app !== false) {
          navigation.navigate('Welcome');
        } else {
          await hideSplashScreen();
          navigation.navigate('Main');
        }
      }
    };
    checkAuth();
  }, [isFocused]);

  useEffect(() => {
    let _mounted = true;

    if (_mounted && readyToServe && user) {
      hideSplashScreen();
      navigation.navigate('Main');
    }

    return () => {
      _mounted = false;
    };
  }, [readyToServe]);

  const theme = getTheme(appearance);

  return (
    <>
      <BackgroundJob />
      {(isFocused || !readyToServe) && (
        <Loading
          auth
          text="잠시만 기다리세요"
          style={{ backgroundColor: theme.colors.logoBG }}
          color={theme.colors.text}
          textStyle={{ color: theme.colors.text }}
        />
      )}
    </>
  );
};

export default withNavigationFocus(SplashScreen);
