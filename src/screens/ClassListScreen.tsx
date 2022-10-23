import { Dimensions, SafeAreaView as NativeSafeAreaView } from 'react-native';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { NavigationState, Route, TabBar, TabView } from 'react-native-tab-view';
import React, { memo, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import WarningDialog, { WarningProps } from '../components/WarningDialog';

import BackButton from '../components/BackButton';
import Body from '../components/Body';
import { ClassListTab } from '../stores/ClassStore';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import Loading from '../components/Loading';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import Right from '../components/Right';
import { SafeAreaView } from 'react-navigation';
import SortButton from '../components/ClassList/SortButton';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import TabClassList from '../components/ClassList/TabClassList';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';
import { SearchableSortDirection } from '../API';

interface Props extends NavigationStackScreenProps {}

const ClassListScreen = ({ navigation }: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();
  if (!user) return <Loading origin="ClassListScreen" />;
  const { username } = user;
  const styles = getStyles(appearance);

  const type = navigation.getParam('type');
  const tempNavIndex = navigation.getParam('navIndex');

  const navIndex = !tempNavIndex ? undefined : typeof tempNavIndex !== 'number' ? Number(tempNavIndex) : tempNavIndex;
  const origin = navigation.getParam('origin');

  const [sort, setSort] = useState<string>('desc');
  const [tabViewState, setTabViewState] = useState<NavigationState<Route>>({ index: navIndex ?? 0, routes: [] });
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);

  const _handleBackButton = useCallback(() => {
    // if (origin && origin === 'Noti') {
    //   navigation.pop();
    // } else
    if (origin) {
      navigation.navigate(origin);
    } else {
      navigation.goBack();
    }
  }, []);

  useHandleAndroidBack(navigation, _handleBackButton);

  const _handleIndexChange = (index: number) => setTabViewState({ index, routes: tabViewState.routes });
  const _handleOnDismiss = () => {
    setWarningProps(null);
  };
  const OnClassList = (
    <TabClassList
      sort={sort}
      username={username}
      type="hosted"
      setWarningProps={setWarningProps}
      tabLabel={ClassListTab.on}
      snackbarDispatch={snackbarDispatch}
      appearance={appearance}
    />
  );

  const ClosedClassList = (
    <TabClassList
      sort={sort}
      username={username}
      type="hosted"
      setWarningProps={setWarningProps}
      tabLabel={ClassListTab.closed}
      snackbarDispatch={snackbarDispatch}
      appearance={appearance}
    />
  );

  const OffClassList = (
    <TabClassList
      sort={sort}
      username={username}
      type="hosted"
      setWarningProps={setWarningProps}
      tabLabel={ClassListTab.off}
      snackbarDispatch={snackbarDispatch}
      appearance={appearance}
    />
  );

  const YetClassList = (
    <TabClassList
      sort={sort}
      username={username}
      type="proxied"
      setWarningProps={setWarningProps}
      tabLabel={ClassListTab.yet}
      snackbarDispatch={snackbarDispatch}
      appearance={appearance}
    />
  );

  const ReviewedClassList = (
    <TabClassList
      sort={sort}
      username={username}
      type="proxied"
      setWarningProps={setWarningProps}
      tabLabel={ClassListTab.reviewed}
      snackbarDispatch={snackbarDispatch}
      appearance={appearance}
    />
  );

  const ReviewHostClassList = (
    <TabClassList
      sort={sort}
      username={username}
      type="toReview"
      setWarningProps={setWarningProps}
      tabLabel={ClassListTab.yet}
      snackbarDispatch={snackbarDispatch}
      appearance={appearance}
    />
  );

  const ReviewProxyClassList = (
    <TabClassList
      sort={sort}
      username={username}
      type="toReview"
      setWarningProps={setWarningProps}
      tabLabel={ClassListTab.toBeProxied}
      snackbarDispatch={snackbarDispatch}
      appearance={appearance}
    />
  );

  useEffect(() => {
    let _mounted = true;

    let routes: any[] = [];

    switch (type) {
      case 'hosted':
        routes = [
          { key: 'on', title: ClassListTab.on },
          { key: 'closed', title: ClassListTab.closed },
          { key: 'off', title: ClassListTab.off },
        ];
        break;
      case 'proxied':
        routes = [
          { key: 'yet', title: ClassListTab.yet },
          { key: 'reviewed', title: ClassListTab.reviewed },
        ];
        break;
      case 'toReview':
        routes = [
          { key: 'toBeProxied', title: ClassListTab.toBeProxied },
          { key: 'yet', title: ClassListTab.yet },
        ];
        break;
    }

    if (_mounted && routes !== []) {
      setTabViewState({ index: navIndex !== undefined ? navIndex : 0, routes });
    }

    return () => {
      _mounted = false;
    };
  }, [type, navIndex]);

  const headerTitle = useMemo(() => {
    switch (type) {
      case 'hosted':
        return '호스트 클래스 리스트';
      case 'proxied':
        return '담당 클래스 리스트';
      case 'toReview':
        return '리뷰 대기 클래스 리스트';
    }
  }, [type]);

  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body flex={5}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>{headerTitle}</HeaderTitle>
        </Body>
        <Right>
          <SortButton sort={sort} setSort={setSort} />
        </Right>
      </SwitchStackHeader>
    );
  };

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        indicatorStyle={styles.tabBarIndicatorStyle}
        activeColor={getThemeColor('primary', appearance)}
        inactiveColor={getThemeColor('placeholder', appearance)}
        style={styles.tabBarStyle}
      />
    ),
    [appearance],
  );

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={appearance} />
      {renderHeader()}
      <NativeSafeAreaView style={styles.contentContainerView}>
        <TabView
          lazy
          navigationState={tabViewState}
          onIndexChange={_handleIndexChange}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'on':
                return OnClassList;
              case 'closed':
                return ClosedClassList;
              case 'off':
                return OffClassList;
              case 'yet':
                if (type === 'proxied') {
                  return YetClassList;
                }
                return ReviewHostClassList;
              case 'reviewed':
                return ReviewedClassList;
              case 'toBeProxied':
                return ReviewProxyClassList;
              default:
                return null;
            }
          }}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={renderTabBar}
          swipeEnabled
        />
      </NativeSafeAreaView>
      <NeedAuthBottomSheet navigation={navigation} />

      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      {warningProps && (
        <WarningDialog
          {...warningProps}
          handleDismiss={_handleOnDismiss}
          visible
          snackbarDispatch={snackbarDispatch}
          dismissText="아니오"
          dismissable
          navigation={navigation}
          appearance={appearance}
        />
      )}
    </SafeAreaView>
  );
};

export default memo(ClassListScreen);
