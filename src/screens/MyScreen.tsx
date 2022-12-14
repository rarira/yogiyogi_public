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
          title="???????????? ??????"
          description="?????? ???????????? ????????? ????????? ?????? ????????????"
          style={styles.listItem}
          onPress={_handleNav('MyCenter')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        */}
        <List.Item
          title="?????? ????????? ??????"
          // description="?????? ???????????? ??????????????? ?????? ???????????? ????????? ??? ????????? ?????? ??? ????????????"
          description="?????? ???????????? ??????????????? ?????? ???????????? ????????? ??? ????????? ?????? ??? ????????????"
          style={styles.listItem}
          onPress={_handleNav('MySubs')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="????????? ????????? ??????"
          // description="???????????? ?????????/???????????? ???????????????"
          description="???????????? ???????????? ???????????????"
          style={styles.listItem}
          onPress={_handleNav('BookmarkList')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="?????? ????????? ??????"
          // description="????????? ?????????/?????????/???????????? ???????????????"
          description="????????? ?????????/???????????? ???????????????"
          style={styles.listItem}
          onPress={_handleNav('MyBlockedList')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <ThickDivider appearance={appearance} />
        <List.Item
          title="??? ????????????"
          description="??? ????????? ????????? ????????? ?????? ??? ????????????"
          style={styles.listItem}
          onPress={_handleNav('MySettings')}
          right={renderRightIcon(null)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="??? ????????????"
          description="?????? ????????? ?????? ???????????? ?????? ????????????????"
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
