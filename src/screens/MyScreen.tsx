import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { NavigationFocusInjectedProps, ScrollView, withNavigationFocus } from 'react-navigation';
import React, { useReducer, useState } from 'react';
import { RefreshControl, SafeAreaView } from 'react-native';

import AndroidDivider from '../components/AndroidDivider';
import { GetUserQuery } from '../API';
import { List } from 'react-native-paper';
import Loading from '../components/Loading';
// import MyClassList from '../components/My/MyClassList';
import MyNavBar from '../components/My/MyNavBar';
import MyPostList from '../components/My/MyPostList';
import MyProfile from '../components/My/MyProfile';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import StatusBarNormal from '../components/StatusBarNormal';
import StoreRatings from '../components/My/StoreRatings';
import ThickDivider from '../components/ThickDivider';
import _handleAppShare from '../components/My/AppShare';
import { customGetUserProfile } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

// import useHandleAndroidBack from '../functions/handleAndroidBack';
// import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';

interface Props extends NavigationFocusInjectedProps {}

const GET_USER_PROFILE = gql(customGetUserProfile);

const MyScreen = ({ navigation, isFocused }: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const styles = getStyles(appearance);
  const [refreshing, setRefreshing] = useState(false);

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);

  const { error, data, refetch, networkStatus } = useQuery(GET_USER_PROFILE, {
    skip: !user,
    variables: { id: user?.username ?? '' },
    fetchPolicy: 'cache-and-network',
  });

  // const _handleBackNav = () => navigation.goBack();

  // useHandleAndroidBack(navigation, _handleBackNav);

  const renderBody = () => {
    const _handleNav = (route: string) => () => navigation.navigate(route);

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
    const renderRightIcon = (props: any) => () => (
      <List.Icon icon="keyboard-arrow-right" style={styles.listIcon} {...props} />
    );

    if (!data || !data.getUser) {
      return <Loading origin="MyScreen" />;
    }
    if (error) {
      reportSentry(error);

      const retry = () => navigation.navigate('My');
      // snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
      return (
        <AccessDenied
          category={AccessDeniedReason.Error}
          target={AccessDeniedTarget.Error}
          // extraInfo={error.message}
          retry={retry}
        />
      );
    }
    const { getUser }: { getUser: GetUserQuery['getUser'] } = data;

    return (
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}>
        <MyProfile data={getUser} />
        <ThickDivider appearance={appearance} />
        {/* <MyClassList appearance={appearance} /> */}
        <ThickDivider appearance={appearance} />
        <MyPostList appearance={appearance} />
        <ThickDivider appearance={appearance} />
        {/* <List.Item
          title="마이센터 관리"
          description="자주 이용하는 센터를 등록해 두면 편합니다"
          style={styles.listItem}
          onPress={_handleNav('MyCenter')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        */}
        <List.Item
          title="구독 키워드 관리"
          // description="관심 키워드를 구독하시면 해당 클래스가 등록될 때 알림을 받을 수 있습니다"
          description="관심 키워드를 구독하시면 해당 게시물이 등록될 때 알림을 받을 수 있습니다"
          style={styles.listItem}
          onPress={_handleNav('MySubs')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="북마크 리스트 관리"
          // description="북마크한 클래스/게시물을 관리합니다"
          description="북마크한 게시물을 관리합니다"
          style={styles.listItem}
          onPress={_handleNav('BookmarkList')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="차단 리스트 관리"
          // description="차단한 클래스/사용자/게시물을 관리합니다"
          description="차단한 사용자/게시물을 관리합니다"
          style={styles.listItem}
          onPress={_handleNav('MyBlockedList')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <ThickDivider appearance={appearance} />
        <List.Item
          title="앱 설정하기"
          description="앱 사용과 관련한 설정을 하실 수 있습니다"
          style={styles.listItem}
          onPress={_handleNav('MySettings')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="앱 공유하기"
          description="많은 사람이 함께 사용하면 더욱 편리하겠죠?"
          style={styles.listItem}
          onPress={_handleAppShare}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        <StoreRatings appearance={appearance} />
      </ScrollView>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.contentContainerView}>
        <StatusBarNormal appearance={appearance} />
        <MyNavBar />

        {!!user && renderBody()}
      </SafeAreaView>
      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      <NeedAuthBottomSheet navigation={navigation} isFocused={isFocused} />
    </>
  );
};

export default withNavigationFocus(MyScreen);
