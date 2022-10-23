import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import { AccountStatusType, ReportTargetType } from '../API';
import { List, Portal } from 'react-native-paper';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { useCallback, useMemo, useReducer, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import WarningDialog, { WarningProps } from '../components/WarningDialog';

import AndroidDivider from '../components/AndroidDivider';
import Body from '../components/Body';
import CancelButton from '../components/CancelButton';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import Loading from '../components/Loading';
import ModalScreenContainer from './ModalScreenContainter';
import MyDivider from '../components/MyDivider';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import ReportForm from '../components/ReportForm';
import Right from '../components/Right';
import ShowManners from '../components/userProfile/ShowManners';
import ShowUserRatings from '../components/userProfile/ShowUserRatings';
import SwitchStackHeader from '../components/SwitchStackHeader';
import ThickDivider from '../components/ThickDivider';
import UserActionMenuButton from '../components/UserActionMenuButton';
import UserProfileHeader from '../components/userProfile/UserProfileHeader';
import { customGetUserProfile } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';
import { getTheme, getThemeColor } from '../configs/theme';

interface Props extends NavigationStackScreenProps {}

const GET_USER_PROFILE = gql(customGetUserProfile);

const UserProfileScreen = ({ navigation }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);

  const [modalVisible, setModalVisible] = useState(false);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    authStore: { user, identityId, appearance },
  } = useStoreState();

  const origin = navigation.getParam('origin');
  const userId = navigation.getParam('userId');
  const userName = navigation.getParam('userName');

  const userIdentityId = navigation.getParam('userIdentityId');
  const type = navigation.getParam('type');
  const isMyself = !!user && user.username === userId;

  const { error, data, refetch, networkStatus } = useQuery(GET_USER_PROFILE, {
    variables: { id: userId },
    fetchPolicy: 'cache-and-network',
  });

  const _handleBackButton = useCallback(() => {
    if (origin === 'ReviewsList') {
      navigation.pop();
    } else if (origin) {
      navigation.navigate(origin);
    } else {
      navigation.pop();
    }
  }, [origin]);

  useHandleAndroidBack(navigation, _handleBackButton);

  const _handleNav = (route: string, params?: object) => () => navigation.push(route, params);

  const renderHeader = useMemo(() => {
    const isReviewable = !!user && data?.getUser?.mannerReviewed && data.getUser.mannerReviewed.includes(user.username);
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <CancelButton onPress={_handleBackButton} />
        </Left>
        <Body flex={4}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>{userName || '사용자 프로필'}</HeaderTitle>
        </Body>
        <Right>
          {userId !== 'admin' && (
            <UserActionMenuButton
              userId={userId}
              userName={userName}
              refetch={refetch}
              setWarningProps={setWarningProps}
              setModalVisible={setModalVisible}
              origin={origin}
              isReviewable={isReviewable}
            />
          )}
        </Right>
      </SwitchStackHeader>
    );
  }, [userName, userId, origin, data, appearance]);

  if (!data || !data.getUser) {
    return <Loading origin={`UserProfileScreen-${userName}`} />;
  }

  if (error) {
    reportSentry(error);
    // snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return (
      <AccessDenied
        category={AccessDeniedReason.Error}
        target={AccessDeniedTarget.User}
        navigateRoute={origin}
        extraInfo={error.message}
      />
    );
  }

  if (data.getUser.accountStatus === AccountStatusType.disabled) {
    return (
      <AccessDenied
        category={AccessDeniedReason.UserDisabled}
        target={AccessDeniedTarget.User}
        navigateRoute={origin}
      />
    );
  }

  if (!!user && data.getUser.blockedUser && data.getUser.blockedUser.includes(user.username)) {
    return (
      <AccessDenied
        category={AccessDeniedReason.UserBlockedBy}
        target={AccessDeniedTarget.User}
        navigateRoute={origin === 'ChatView' ? type : origin}
      />
    );
  }

  if (!!user && data.getUser.blockedBy && data.getUser.blockedBy.includes(user.username)) {
    return (
      <AccessDenied
        category={AccessDeniedReason.UserBlocked}
        target={AccessDeniedTarget.User}
        extraInfo={data.getUser.name}
        navigateRoute={origin}
      />
    );
  }

  const theme = getTheme(appearance);
  const styles = getStyles(appearance);

  const { getUser } = data;

  const renderRightIcon = (props: any) => {
    return <List.Icon {...props} icon="keyboard-arrow-right" style={styles.listIcon} color={theme.colors.text} />;
  };

  let mannersArray = Object.entries(getUser.mannerCounter as { [key: string]: number })
    .filter(val => typeof val[1] === 'number' && val[1] !== 0)
    .sort((a, b) => b[1] - a[1]);

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

  // console.log(userId);

  return (
    <ModalScreenContainer
      // origin={origin}
      children1={
        <>
          {renderHeader}

          <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}>
            {networkStatus === 4 ? (
              <Loading origin="UserProfileScreen" />
            ) : (
              <>
                <UserProfileHeader
                  isMyself={isMyself}
                  userIdentityId={isMyself ? identityId : userIdentityId}
                  data={getUser}
                  fromChat={origin === 'ChatView'}
                  appearance={appearance}
                />
                <MyDivider appearance={appearance} />
                {/* <AndroidDivider needMarginHorizontal /> */}
                {/* <ShowUserRatings ratings={getUser.ratings} appearance={appearance} /> */}
                {/* <ThickDivider appearance={appearance} />
                <List.Item
                  title="받은 리뷰 : 매너 보기"
                  description="아래에는 빈도가 높은 세가지 순으로 보입니다"
                  style={[styles.listItem, { paddingBottom: 0 }]}
                  onPress={_handleNav('MannersList', {
                    manners: mannersArray,
                    privacySetting: getUser.settings.privacyManners,
                    userName: getUser.name,
                    userId: getUser.id,
                  })}
                  right={mannersArray.length > 0 ? renderRightIcon : undefined}
                  titleStyle={styles.listItemTitle}
                  descriptionStyle={styles.listItemDescription}
                />
                <ShowManners manners={mannersArray.slice(0, 3)} appearance={appearance} />
                <AndroidDivider needMarginHorizontal />
                <List.Item
                  title="받은 리뷰 : 코멘트 보기"
                  description="거래 상대방이 남긴 코멘트를 봅니다"
                  style={styles.listItem}
                  onPress={_handleNav('ReviewsList', {
                    userId,
                    privacySetting: getUser.settings.privacyManners,
                    userName: getUser.name,
                  })}
                  right={renderRightIcon}
                  titleStyle={styles.listItemTitle}
                  descriptionStyle={styles.listItemDescription}
                /> */}
              </>
            )}
          </ScrollView>
        </>
      }
      children2={
        <>
          <Portal>
            {!!user && (
              <ReportForm
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                target="사용자"
                targetId={userId!}
                reportTargetType={ReportTargetType.userReport}
                numOfReported={1}
                setWarningProps={setWarningProps}
                submitted={Boolean(warningProps)}
              />
            )}
          </Portal>
          <Portal>
            {warningProps && (
              <WarningDialog
                {...warningProps}
                handleDismiss={() => setWarningProps(null)}
                dismissable
                dismissText="아니오"
                visible
                snackbarDispatch={snackbarDispatch}
                origin={origin}
                navigation={navigation}
                appearance={appearance}
              />
            )}
          </Portal>
          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
        </>
      }
    />
  );
};

export default UserProfileScreen;
