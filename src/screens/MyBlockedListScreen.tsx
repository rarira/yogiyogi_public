import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import MyBlockedList, { MyBlockedListTab } from '../components/My/MyBlockedList';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { NavigationState, Route, TabBar, TabView } from 'react-native-tab-view';
import React, { useCallback, useMemo, useReducer, useState } from 'react';

import BackButton from '../components/BackButton';
import Body from '../components/Body';
import { Dimensions } from 'react-native';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import Loading from '../components/Loading';
import { SafeAreaView as NativeSafeAreaView } from 'react-native';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import Right from '../components/Right';
import { SafeAreaView } from 'react-navigation';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { getMyBlockedList } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';
import styles from '../configs/styles';
import theme from '../configs/theme';
import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';

interface Props extends NavigationStackScreenProps {}

const GET_MY_BLOCKED_LIST = gql(getMyBlockedList);

const MyBlockedListScreen = ({ navigation }: Props) => {
  let routes = [
    // { key: 'class', title: MyBlockedListTab.Class },
    { key: 'post', title: MyBlockedListTab.Post },
    { key: 'user', title: MyBlockedListTab.User },
  ];

  const [tabViewState, setTabViewState] = useState<NavigationState<Route>>({ index: 0, routes });
  const [refreshing, setRefreshing] = useState(false);

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);

  const {
    authStore: { user, appearance },
  } = useStoreState();
  const styles = getStyles(appearance);

  const username = user?.username ?? '';

  const { error, data, refetch, networkStatus, updateQuery } = useQuery(GET_MY_BLOCKED_LIST, {
    variables: { id: username },
    fetchPolicy: 'cache-and-network',
  });

  const _handleBackButton = () => {
    navigation.goBack();
  };

  // useHandleAndroidBack(navigation, _handleBackButton);

  const _handleIndexChange = (index: number) => setTabViewState({ index, routes: tabViewState.routes });

  const renderHeader = useMemo(() => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body flex={5}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>차단 리스트</HeaderTitle>
        </Body>
        <Right></Right>
      </SwitchStackHeader>
    );
  }, [appearance]);

  const renderTabBar = useCallback(
    (props: any) => {
      return (
        <TabBar
          {...props}
          indicatorStyle={styles.tabBarIndicatorStyle}
          activeColor={getThemeColor('primary', appearance)}
          inactiveColor={getThemeColor('placeholder', appearance)}
          style={styles.tabBarStyle}
        />
      );
    },
    [appearance],
  );

  if (!data || !data.getUser) {
    return <Loading origin="MyBlockedListScreen" />;
  }

  if (error)
    return <AccessDenied category={AccessDeniedReason.Error} navigateRoute="My" target={AccessDeniedTarget.Error} />;

  const _handleRefreshControl = () => {
    setRefreshing(true);
    refetch()
      .then(result => {
        setRefreshing(false);
      })
      .catch(error => {
        reportSentry(error);
        setRefreshing(false);
      });
  };

  const { blockedUser, blockedClass, blockedPost } = data.getUser;
  const BlockedClassList = (
    <MyBlockedList
      data={blockedClass || []}
      myId={username}
      tabLabel={MyBlockedListTab.Class}
      snackbarDispatch={snackbarDispatch}
      handleOnRefresh={_handleRefreshControl}
      networkStatus={networkStatus}
      updateQuery={updateQuery}
      appearance={appearance}
      refreshing={refreshing}
    />
  );
  const BlockedUserList = (
    <MyBlockedList
      data={blockedUser || []}
      myId={username}
      tabLabel={MyBlockedListTab.User}
      snackbarDispatch={snackbarDispatch}
      networkStatus={networkStatus}
      updateQuery={updateQuery}
      handleOnRefresh={_handleRefreshControl}
      appearance={appearance}
      refreshing={refreshing}
    />
  );
  const BlockedPostList = (
    <MyBlockedList
      data={blockedPost || []}
      myId={username}
      tabLabel={MyBlockedListTab.Post}
      snackbarDispatch={snackbarDispatch}
      networkStatus={networkStatus}
      updateQuery={updateQuery}
      handleOnRefresh={_handleRefreshControl}
      appearance={appearance}
      refreshing={refreshing}
    />
  );

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={appearance} />
      {renderHeader}
      <NativeSafeAreaView style={styles.contentContainerView}>
        <TabView
          navigationState={tabViewState}
          onIndexChange={_handleIndexChange}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'user':
                return BlockedUserList;
              case 'class':
                return BlockedClassList;
              case 'post':
                return BlockedPostList;
              default:
                return null;
            }
          }}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={renderTabBar}
          swipeEnabled={true}
        />
      </NativeSafeAreaView>

      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
    </SafeAreaView>
  );
};

export default MyBlockedListScreen;
