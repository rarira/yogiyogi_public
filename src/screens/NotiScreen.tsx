import { Button, Dialog } from 'react-native-paper';
import { Dimensions, SafeAreaView as NativeSafeAreaView } from 'react-native';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { NavigationState, Route, TabBar, TabView } from 'react-native-tab-view';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView, withNavigationFocus } from 'react-navigation';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import AsyncStorage from '@react-native-community/async-storage';
import BackButton from '../components/BackButton';
import Body from '../components/Body';
import { CHANGE_NEW_NOTIS } from '../stores/actionTypes';
import CommNotis from '../components/noti/CommNotis';
import GenNotis from '../components/noti/GenNotis';
import HeaderTitle from '../components/HeaderTitle';
import KeywordNotis from '../components/noti/KeywordNotis';
import KoreanParagraph from '../components/KoreanParagraph';
import Left from '../components/Left';
import MyDialogContainer from '../components/MyDialogContainer';
import MySubsButton from '../components/noti/MySubsButton';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NewClassNotisClearButton from '../components/noti/NewClassNotisClearButton';
import NotiTabBarBadge from '../components/noti/NotiTabBarBadge';
import Right from '../components/Right';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import reportSentry from '../functions/reportSentry';

import { getThemeColor } from '../configs/theme';
import ThemedButton from '../components/ThemedButton';
import { getStyles } from '../configs/styles';
import MyDialogTitle from '../components/MyDialogTitle';

// import useHandleAndroidBack from '../functions/handleAndroidBack';

interface Props extends NavigationStackScreenProps {
  isFocused: boolean;
}

const NotiScreen = ({ navigation, isFocused }: Props) => {
  // const origin = navigation.getParam('origin');
  const tabNo = navigation.getParam('tabNo');
  const navIndex = !!tabNo && typeof tabNo !== 'number' ? Number(tabNo) : tabNo;

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [dialogVisible, setDialogVisible] = useState<string | null>(null);
  const [tabViewState, setTabViewState] = useState<NavigationState<Route>>({
    index: navIndex ?? 0,
    routes: [
      { key: 'genNotis', title: '새로운 소식' },
      // { key: 'keywordNotis', title: '키워드 알림' },
      { key: 'commNotis', title: '게시판 알림' },
    ],
  });

  const {
    authStore: { user, subscribedTags, newGenNotisAvailable, newCommNotisAvailable, appState, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);

  const _handleIndexChange = (index: number) => setTabViewState({ index, routes: tabViewState.routes });
  const _handleNavToMySubs = () => {
    setDialogVisible('hold');
    navigation.navigate('MySubs', { origin: 'Noti' });
  };
  const _handleDialogVisible = (state: string) => () => setDialogVisible(state);

  useEffect(() => {
    let _mounted = true;
    const storeTime = async (time: string) => {
      try {
        await AsyncStorage.setItem(`${user?.username ?? ''}_lastNotiFocusedTime`, time);
      } catch (e) {
        reportSentry(e);
      }
    };

    if (appState === 'active' && isFocused && !!user && _mounted) {
      if (tabViewState.index === 0) {
        const now = new Date().toISOString();
        storeTime(now);
        if (newGenNotisAvailable) {
          storeDispatch({ type: CHANGE_NEW_NOTIS, newGenNotisAvailable: false });
        }
      } else if (tabViewState.index === 2) {
        if (newCommNotisAvailable) {
          storeDispatch({ type: CHANGE_NEW_NOTIS, newCommNotisAvailable: false });
        }
      }
    }
    return () => {
      _mounted = false;
    };
  }, [tabViewState.index, isFocused, appState]);

  useEffect(() => {
    if (
      tabViewState.index === 1 &&
      dialogVisible !== 'checked' &&
      (!subscribedTags || subscribedTags.length === 0) &&
      dialogVisible !== 'hold'
    ) {
      setDialogVisible('needWarning');
    }
  }, [subscribedTags, tabViewState.index, dialogVisible]);

  // console.log(dialogVisible, subscribedTags, tabViewState);
  // useEffect(() => {
  //   let _mounted = true;
  //   if (_mounted && !!tabNo) {
  //     const navIndex = typeof tabNo !== 'number' ? Number(tabNo) : tabNo;
  //     _handleIndexChange(navIndex);
  //   }
  //   return () => {
  //     _mounted = false;
  //   };
  // }, [tabNo]);

  const _handleBackButton = () => {
    navigation.goBack();
    // if (origin) {
    //   navigation.navigate(origin);
    // } else {
    //   navigation.pop();
    // }
  };

  // useHandleAndroidBack(navigation, _handleBackButton);

  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>알림</HeaderTitle>
        </Body>
        <Right>
          {tabViewState.index === 1 && (
            <>
              <NewClassNotisClearButton />
              {/* <MySubsButton origin="Noti" /> */}
            </>
          )}
        </Right>
      </SwitchStackHeader>
    );
  };

  const renderTabBar = useCallback(
    (props: any) => {
      return (
        <TabBar
          {...props}
          indicatorStyle={styles.tabBarIndicatorStyle}
          renderBadge={({ route }) => <NotiTabBarBadge route={route} />}
          activeColor={getThemeColor('primary', appearance)}
          inactiveColor={getThemeColor('placeholder', appearance)}
          style={styles.tabBarStyle}
        />
      );
    },
    [appearance],
  );

  const GenNotiLists = (
    <GenNotis snackbarDispatch={snackbarDispatch} userId={user?.username ?? ''} isFocused={tabViewState.index === 0} />
  );
  const CommNotiLists = (
    <CommNotis isFocused={tabViewState.index === 2} snackbarDispatch={snackbarDispatch} userId={user?.username ?? ''} />
  );
  const KeywordNotiLists = <KeywordNotis isFocused={tabViewState.index === 1} />;

  return (
    <SafeAreaView style={styles.contentContainerView}>
      {/* <NavigationEvents onWillBlur={payload => lert('will blur')} /> */}
      <StatusBarNormal appearance={appearance} />
      {renderHeader()}

      <NativeSafeAreaView style={[styles.contentContainerView]}>
        <TabView
          navigationState={tabViewState}
          onIndexChange={_handleIndexChange}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'genNotis':
                return GenNotiLists;
              case 'commNotis':
                return CommNotiLists;
              case 'keywordNotis':
                return KeywordNotiLists;

              default:
                return null;
            }
          }}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={renderTabBar}
          swipeEnabled={true}
          lazy
        />
      </NativeSafeAreaView>
      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />

      <MyDialogContainer
        visible={dialogVisible === 'needWarning'}
        onDismiss={_handleDialogVisible('checked')}
        dismissable
      >
        <MyDialogTitle>구독 키워드 없음</MyDialogTitle>
        <Dialog.Content>
          <KoreanParagraph
            text="구독중인 키워드가 없습니다. 키워드 알림을 받으시려면 구독하셔야 합니다"
            textStyle={styles.dialogContentWarningText}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleDialogVisible('checked')}>계속</ThemedButton>
          <ThemedButton onPress={_handleNavToMySubs} color={getThemeColor('accent', appearance)}>
            키워드 구독하기
          </ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </SafeAreaView>
  );
};

export default withNavigationFocus(NotiScreen);
