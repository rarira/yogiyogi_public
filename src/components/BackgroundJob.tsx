import { Alert, AppState, AppStateStatus, Linking, Platform, useColorScheme } from 'react-native';
import { CHANGE_APP_STATE, CHANGE_NEW_NOTIS, SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import React, { useEffect } from 'react';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import { APP_PREFIX } from '../configs/variables';
import AsyncStorage from '@react-native-community/async-storage';
// import { NewClassNotiType } from '../types/store';
import OneSignal from 'react-native-onesignal';
import debounce from 'lodash/debounce';
// import { addNewClassNoti } from '../functions/manageNewClassNotis';
// import asyncForEach from '../functions/asyncForEach';
import produce from 'immer';
import reportSentry from '../functions/reportSentry';

// import PushNotificationIOS from '@react-native-community/push-notification-ios';

interface Props {}

const BackgroundJob = ({}: Props) => {
  const {
    authStore: {
      user,
      newClassNotis,
      // subscribedTags,
      hearts,
      postLikes,
      isInternetReachable,
      newChats,
      simpleSearchHistory,
      detailSearchHistory,
      isFirst,
    },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const colorScheme = useColorScheme();
  // console.log(colorScheme);
  useEffect(() => {
    storeDispatch({
      type: CHANGE_APP_STATE,
      appearance: colorScheme,
    });
  }, [colorScheme]);

  // console.log('background job has', newClassNotis, subscribedTags);

  useEffect(() => {
    const _handleAppStateChange = (nextAppState: AppStateStatus) => {
      storeDispatch({
        type: CHANGE_APP_STATE,
        appState: nextAppState,
      });
    };

    const _handleAppStateBlur = () => {
      storeDispatch({
        type: CHANGE_APP_STATE,
        appState: 'background',
      });
    };
    const _handleAppStateFocus = () => {
      storeDispatch({
        type: CHANGE_APP_STATE,
        appState: 'active',
      });
    };

    // console.log('Background is running');
    const _handleNotisReceived = async (notification: any) => {
      // console.log(notification);
      try {
        const { payload } = notification;

        if (payload.additionalData?.notiType === 'message') {
          const { notiConvId } = payload.additionalData;
          const nextNewChats = produce(newChats, (draft: string[]) => {
            if (!draft.includes(notiConvId)) {
              draft.push(notiConvId);
            }
          });
          storeDispatch({
            type: SET_AUTHSTORE_STATE,
            newChats: nextNewChats,
          });
        } else if (payload.additionalData?.notiType === 'genClassOpen') {
          // console.log('now new class Notis available');
          storeDispatch({
            type: CHANGE_NEW_NOTIS,
            newClassNotisAvailable: true,
          });
        } else if (payload.additionalData?.notiType === 'genPostOpen') {
          // console.log('now new class Notis available');
          storeDispatch({
            type: CHANGE_NEW_NOTIS,
            newPostNotisAvailable: true,
          });
        } else if (payload.additionalData?.notiType === 'newComment') {
          storeDispatch({
            type: CHANGE_NEW_NOTIS,
            newCommNotisAvailable: true,
          });
        } else {
          storeDispatch({
            type: CHANGE_NEW_NOTIS,
            newGenNotisAvailable: true,
          });
        }
      } catch (e) {
        reportSentry(e);
      }
    };

    if (!!user) {
      OneSignal.addEventListener('received', _handleNotisReceived);
    }

    //handle KakaoLink
    const _handleKakaoLink = (url: string) => {
      if (url.startsWith('kakao')) {
        const param = url.split('link=/')[1];

        Linking.openURL(`${APP_PREFIX}${param}`);
      }
    };

    Linking.getInitialURL()
      .then(url => {
        if (url) _handleKakaoLink(url);
      })
      .catch(err => console.error('An error occurred', err));

    Linking.addEventListener('url', event => {
      _handleKakaoLink(event.url);
    });

    AppState.addEventListener('change', _handleAppStateChange);
    if (Platform.OS === 'android') {
      AppState.addEventListener('blur', _handleAppStateBlur);
      AppState.addEventListener('focus', _handleAppStateFocus);
    }

    const netInfoUnsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      // console.log(state.isInternetReachable);
      if (state.isInternetReachable !== null && isInternetReachable !== state.isInternetReachable) {
        // console.log(state.isInternetReachable);
        storeDispatch({
          type: CHANGE_APP_STATE,
          isInternetReachable: state.isInternetReachable,
        });
      }
    });

    // setInterval(() => console.log('backgroud is running'), 3000);

    return () => {
      if (!!user) {
        // console.log('onesignal event listener removed');
        OneSignal.removeEventListener('received', _handleNotisReceived);
      }
      // console.log('backgourndJob will unmount');
      netInfoUnsubscribe();
    };
  }, [user]);

  useEffect(() => {
    debounce(async () => {
      if (hearts) {
        try {
          await AsyncStorage.setItem(!!user ? `${user.username}_hearts` : 'guest_hearts', JSON.stringify(hearts));
        } catch (e) {
          reportSentry(e);
        }
      }
    }, 5000)();
  }, [user, hearts]);

  useEffect(() => {
    debounce(async function() {
      try {
        await AsyncStorage.setItem(`${!!user ? user.userName : 'guest'}_isFirst`, JSON.stringify(isFirst));
      } catch (e) {
        reportSentry(e);
      }
    }, 5000)();
  }, [user, isFirst]);

  useEffect(() => {
    debounce(async () => {
      if (postLikes) {
        try {
          await AsyncStorage.setItem(!!user ? `${user.username}_postLikes` : 'guest_postLikes', JSON.stringify(postLikes));
        } catch (e) {
          reportSentry(e);
        }
      }
    }, 5000)();
  }, [user, postLikes]);

  useEffect(() => {
    if (!!user) {
      debounce(async () => {
        // if (newClassNotis) {
        try {
          await AsyncStorage.setItem(`${user.username}_keywordNotis`, JSON.stringify(newClassNotis));
          // console.log('new class notis saved');
        } catch (e) {
          reportSentry(e);
        }
        // }
      }, 5000)();
    }
  }, [newClassNotis, user]);

  useEffect(() => {
    debounce(async () => {
      if (simpleSearchHistory) {
        try {
          await AsyncStorage.setItem(`${user ? user.username : 'guest'}_simpleSearchHistory`, JSON.stringify(simpleSearchHistory));
          // console.log('new class notis saved');
        } catch (e) {
          reportSentry(e);
        }
      }
    }, 5000)();
  }, [simpleSearchHistory]);

  useEffect(() => {
    debounce(async () => {
      if (detailSearchHistory) {
        try {
          await AsyncStorage.setItem(`${user ? user.username : 'guest'}_detailSearchHistory`, JSON.stringify(detailSearchHistory));
          // console.log('new class notis saved');
        } catch (e) {
          reportSentry(e);
        }
      }
    }, 5000)();
  }, [detailSearchHistory]);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && !isInternetReachable) {
      Alert.alert(
        '인터넷 연결 끊김',
        '인터넷에 연결하지 않으면 정상적인 이용이 불가합니다. 인터넷 연결 후 다시 이용하세요',
        [{ text: 'Cancel', onPress: () => console.log('cancel'), style: 'cancel' }],
        { cancelable: false },
      );
    }

    return () => {
      _mounted = false;
    };
  }, [isInternetReachable]);

  // * 앱스테이트 업데이트시 업데이트하는 방안

  return <></>;
};

export default BackgroundJob;
