import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { NavigationState, Route, TabBar, TabView } from 'react-native-tab-view';
import React, { useCallback, useMemo, useReducer, useState } from 'react';

import BackButton from '../components/BackButton';
import Body from '../components/Body';
import { Dimensions } from 'react-native';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import ReviewsCommentList from '../components/userProfile/ReviewsCommentList';
import Right from '../components/Right';
import SwitchStackHeader from '../components/SwitchStackHeader';

import { getThemeColor } from '../configs/theme';
import useHandleAndroidBack from '../functions/handleAndroidBack';
import { getStyles } from '../configs/styles';
import { useStoreState } from '../stores/initStore';

interface Props extends NavigationStackScreenProps {}

const ReviewsListScreen = ({ navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getStyles(appearance);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [tabViewState, setTabViewState] = useState<NavigationState<Route>>({
    index: 0,
    routes: [
      { key: 'hostComments', title: '호스트 리뷰' },
      { key: 'proxyComments', title: '선생님 리뷰' },
      { key: 'mannersComments', title: '사용자 리뷰' },
    ],
  });

  const userId = navigation.getParam('userId');
  const userName = navigation.getParam('userName');
  const privacySetting = navigation.getParam('privacySetting');

  const HostCommentsList = (
    <ReviewsCommentList
      type="hostComments"
      userId={userId}
      snackbarDispatch={snackbarDispatch}
      privacySetting={privacySetting}
      userName={userName}
      appearance={appearance}
    />
  );

  const ProxyCommentsList = (
    <ReviewsCommentList
      type="proxyComments"
      userId={userId}
      snackbarDispatch={snackbarDispatch}
      privacySetting={privacySetting}
      userName={userName}
      appearance={appearance}
    />
  );
  const MannersCommentsList = (
    <ReviewsCommentList
      type="mannersComments"
      userId={userId}
      snackbarDispatch={snackbarDispatch}
      privacySetting={privacySetting}
      userName={userName}
      appearance={appearance}
    />
  );

  const _handleBackButton = () => navigation.pop();

  useHandleAndroidBack(navigation, _handleBackButton);

  const _handleIndexChange = (index: number) => setTabViewState({ index, routes: tabViewState.routes });

  const renderHeader = useMemo(() => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body flex={5}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>리뷰 코멘트 리스트</HeaderTitle>
        </Body>
        <Right></Right>
      </SwitchStackHeader>
    );
  }, [appearance]);

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
    <ModalScreenContainer
      children1={
        <>
          {renderHeader}
          <TabView
            lazy
            navigationState={tabViewState}
            onIndexChange={_handleIndexChange}
            renderScene={({ route }) => {
              switch (route.key) {
                case 'mannersComments':
                  return MannersCommentsList;
                case 'hostComments':
                  return HostCommentsList;
                case 'proxyComments':
                  return ProxyCommentsList;
                default:
                  return null;
              }
            }}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderTabBar={renderTabBar}
            swipeEnabled={true}
          />
        </>
      }
      children2={<MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />}
    />
  );
};

export default ReviewsListScreen;
