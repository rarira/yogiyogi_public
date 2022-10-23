import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import MySubHeadline from '../MySubHeadline';
import OnBoardingItem from './OnBoardingItem';
import { checkNotifications } from 'react-native-permissions';
import { openSettings } from 'react-native-permissions';
import produce from 'immer';
import reportSentry from '../../functions/reportSentry';
import theme from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';
import { withNavigation } from 'react-navigation';

type OnBoardingState = boolean[];

const onBoardingInitialState: OnBoardingState = [false, false, false, false, false, false];

const OnBoarding = () => {
  const [onBoardingState, setOnBoardingState] = useState<OnBoardingState>(onBoardingInitialState);
  const [notiGranted, setNotiGranted] = useState(false);
  const [activated, setActivated] = useState<number | null>(null);
  const { authStore } = useStoreState();
  let { user, authState, profileUpdated, bookmark, subscribedTags, hearts, identityId, appState } = authStore;

  useEffect(() => {
    let _mounted = true;
    if (_mounted && appState === 'active') {
      (async function() {
        try {
          const notiSettings = await checkNotifications();
          let isPermitted = notiSettings.status === 'granted';

          setNotiGranted(isPermitted);
        } catch (e) {
          reportSentry(e);
        }
      })();
    }
    return () => {
      _mounted = false;
    };
  }, [appState]);

  useEffect(() => {
    let _mounted = true;

    if (_mounted) {
      const nextState = produce(onBoardingState, draft => {
        draft[0] = authState === 'signedIn';
        draft[1] = notiGranted;
        draft[2] = profileUpdated;
        draft[3] = subscribedTags && subscribedTags.length !== 0;
        draft[4] = (!!user && hearts && hearts.used) ?? false;
        draft[5] = bookmark && bookmark.used;
      });
      setOnBoardingState(nextState);
    }

    return () => {
      _mounted = false;
    };
  }, [notiGranted, authState, profileUpdated, bookmark, subscribedTags, hearts]);

  useEffect(() => {
    let _mounted = true;

    if (_mounted) {
      const index = onBoardingState.findIndex(state => state === false);
      if (index === -1) {
        (async function() {
          try {
            if (user) {
              await AsyncStorage.setItem(`${user.username}_isOnBoardingFinished`, 'true');
            }
            await AsyncStorage.setItem(`guest_isOnBoardingFinished`, 'true');
          } catch (e) {
            reportSentry(e);
          }
        })();
      }
      setActivated(index);
    }
    return () => {
      _mounted = false;
    };
  }, [onBoardingState]);

  if (activated === -1) return null;

  const _handleOpenSettings = async () => await openSettings();

  return (
    <View style={styles.container}>
      <View style={styles.screenMarginHorizontal}>
        <MySubHeadline>요기요기 하나씩 따라해 보세요</MySubHeadline>
        {/* <HeadlineSub text="요기요기에 오신 것을 환영합니다. 아래 절차를 하나씩 따라하시면 쉽게 요기요기 이용이 가능합니다." /> */}
        <OnBoardingItem
          checkState={onBoardingState[0]}
          title="로그인 하세요"
          desc="본격적인 사용을 위해서는 로그인이 반드시 필요합니다. 카카오톡 사용자는 번거로운 가입 절차가 필요하지 않습니다"
          activated={activated === 0}
          navTarget="Auth"
        />

        {!!user && (
          <>
            <OnBoardingItem
              checkState={onBoardingState[1]}
              title="앱의 알림 설정을 허용하세요"
              desc="신규 클래스 등록 / 채팅 알림 등을 받으시려면 앱의 알림을 반드시 허용하셔야 합니다"
              activated={activated === 1}
              onPress={_handleOpenSettings}
            />
            <OnBoardingItem
              checkState={onBoardingState[2]}
              title="프로필을 작성하세요"
              desc="구인 클래스 등록 / 응모를 위해서는 최소한의 자기 소개가 필요합니다"
              activated={activated === 2}
              navTarget="UpdateProfile"
              params={{ origin: 'Home', userId: user.username, identityId }}
            />
            <OnBoardingItem
              checkState={onBoardingState[3]}
              title="클래스 키워드를 구독하세요"
              desc="구독한 키워드의 클래스가 등록되면 알림을 받을 수 있습니다"
              activated={activated === 3}
              navTarget="MySubs"
              params={{ origin: 'Home' }}
            />
            <OnBoardingItem
              checkState={onBoardingState[4]}
              title="관심 클래스를 저장하세요"
              desc={`새로 등록된 클래스의 하트 모양 버튼을 터치하거나 클래스 카드를 길게 눌러 관심 클래스를 저장하고 아래 '관심' 메뉴에서 조회할 수 있습니다`}
              activated={activated === 4}
              navTarget="Heart"
              params={{ origin: 'Home' }}
            />
            <OnBoardingItem
              checkState={onBoardingState[5]}
              title={`'클래스' 메뉴에서 클래스를 검색하고 북마크하세요`}
              desc={`모든 클래스를 다양한 조건을 이용하고 중요한 클래스를 북마크하여 저장할 수 있습니다. 북마크한 클래스는 '마이' 메뉴에서 확인할 수 있습니다`}
              activated={activated === 5}
              navTarget="Search"
              // params={{ origin: 'Home' }}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: theme.size.big,
    paddingVertical: theme.size.small,
  },
  screenMarginHorizontal: {
    marginHorizontal: theme.size.big,
  },
});

export default withNavigation(OnBoarding);
