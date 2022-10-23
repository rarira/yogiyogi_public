import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import { AccountStatusType, ClassStatusType, GetClassQuery, ReportTargetType } from '../API';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { Platform, RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import WarningDialog, { WarningProps } from '../components/WarningDialog';
import { customGetClass, onCustomUpdateClass, updateClassStatus } from '../customGraphqls';
import { getTheme, IS_TABLET, normalize } from '../configs/theme';
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import AdminContactButtons from '../components/classView/AdminContactButtons';
import ClassViewButtons from '../components/classView/ClassViewButtons';
import ClassViewCard from '../components/classView/ClassViewCard';
import ClassViewContent from '../components/classView/ClassViewContent';
import ClassViewHeader from '../components/classView/ClassViewHeader';
import FastImage from 'react-native-fast-image';
import ItemShareVisibleDialog from '../functions/ItemShareVisibleDialog';
import LinearGradient from 'react-native-linear-gradient';
import Loading from '../components/Loading';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import NeedProfileUpdate from '../components/NeedProfileUpdate';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { Portal } from 'react-native-paper';
import ReportForm from '../components/ReportForm';
import StatusBarNormal from '../components/StatusBarNormal';
import asyncCheckScreenIsFirst from '../functions/asyncCheckScreenIsFirst';
import getConvsLength from '../functions/getConvsLength';
import getDimensions from '../functions/getDimensions';
import getRandomBG from '../functions/getRandomBG';
import gql from 'graphql-tag';
import guestClient from '../configs/guestClient';
import { handleClassShare } from '../components/classView/KakaoShare';
import reportSentry from '../functions/reportSentry';

import { useActionSheet } from '@expo/react-native-action-sheet';
import { getStyles } from '../configs/styles';
import { AppearanceType } from '../types/store';

interface Props extends NavigationStackScreenProps {}

const { SCREEN_HEIGHT, SCREEN_WIDTH, IS_IPHONE_X, HEADER_HEIGHT, STATUS_BAR_HEIGHT, NAV_BAR_HEIGHT } = getDimensions();

const GET_CLASS = gql(customGetClass);
const UPDATE_CLASS_STATUS = gql(updateClassStatus);
const SUBSCRIBE_TO_CLASS_UPDATE = gql(onCustomUpdateClass);

const ClassViewScreen = ({ navigation }: Props) => {
  const [updateClassStatus, { loading: updateClassStatusLoading }] = useMutation(UPDATE_CLASS_STATUS);

  const parallaxScrollViewEl = useRef<ScrollView>(null);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [shareVisible, setShareVisible] = useState<boolean>(false);
  const [needAuthVisible, setNeedAuthVisible] = useState(false);
  const [needProfileUpdateVisible, setNeedProfileUpdateVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const [centerInfoY, setCenterInfoY] = useState(0);
  const [scheduleInfoY, setScheduleInfoY] = useState(0);
  const [isAdminPost, setIsAdminPost] = useState(false);
  const [bgImage, setBgImage] = useState<any>({ img: null, copyright: '' });
  const { showActionSheetWithOptions } = useActionSheet();
  const [refreshing, setRefreshing] = useState(false);

  const {
    authStore: { user, profileUpdated, identityId, isFirst, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);
  const theme = getTheme(appearance);
  const viewMargin = Platform.OS === 'ios' ? HEADER_HEIGHT + (IS_TABLET ? STATUS_BAR_HEIGHT : 0) : STATUS_BAR_HEIGHT + normalize(55);

  const PARALLAX_HEADER_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - viewMargin;

  // * production
  const classId = navigation.getParam('classId');
  const hostId = navigation.getParam('hostId');
  const origin = navigation.getParam('origin');
  const updated = navigation.getParam('updated');

  // * 개발용
  // const classId = 'aaae040c-f66b-4a0f-8b2b-d38f9f632e64';
  // const hostId = 'rarira';
  // const origin = 'Search';

  const isHost = !!user && hostId === user.username;

  const { error, data, refetch } = useQuery(GET_CLASS, {
    variables: { id: classId },
    fetchPolicy: 'cache-and-network',
    ...(!user && { client: guestClient }),
    notifyOnNetworkStatusChange: true,
  });

  const subs = useSubscription(SUBSCRIBE_TO_CLASS_UPDATE, {
    variables: { id: classId },
    onSubscriptionData: options => {
      try {
        const { onCustomUpdateClass } = options.subscriptionData.data;
        const queryResult = options.client.readQuery({ query: GET_CLASS, variables: { id: classId } });

        if (onCustomUpdateClass.updatedAt ?? null !== queryResult.getClass.updatedAt) {
          let newData: any = { getClass: {} };

          for (const property in queryResult.getClass) {
            if (property !== 'center') {
              newData.getClass[property] = onCustomUpdateClass[property] ?? queryResult.getClass[property];
            } else {
              newData.getClass.center = {};
              for (const property2 in queryResult.getClass.center) {
                newData.getClass.center[property2] = onCustomUpdateClass.center?.[property2] ?? queryResult.getClass.center[property2];
              }
            }
          }

          options.client.writeQuery({
            query: GET_CLASS,
            variables: { id: classId },
            data: newData,
          });

          // Alert.alert('클래스 내용 변경', '호스트가 클래스 내용을 변경하였습니다.');
        }
      } catch (e) {
        reportSentry(e);
      }
    },
  });

  const openAdminPostDialog = useCallback(
    () =>
      setWarningProps({
        dismissable: true,
        dismissText: '알겠습니다',
        dialogTitle: '필독: 외부 구인 공고',
        dialogContent: `본 클래스는 외부의 구인 공고로의 링크를 제공합니다. 요기요기에 게시된 내용은 실제 구인 정보와 다른 내용이 있을 수 있으므로 반드시 아래 '원 구인 공고 확인'을 통해 정확한 구인 내용을 확인하시기 바랍니다.`,
      }),
    [],
  );
  // bgImage 마운트시 가져오기
  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      const bgImage = getRandomBG();
      setBgImage(bgImage);
    }
    return () => {
      _mounted = false;
      subs;
    };
  }, []);

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      if (data?.getClass?.host?.id === 'admin') {
        setIsAdminPost(true);
      }
    }
    return () => {
      _mounted = false;
    };
  }, [data]);

  // 수정이나 신규 등록시
  useEffect(() => {
    let _mounted = true;

    if (_mounted && !!updated && isHost && !shareVisible) {
      setShareVisible(true);
    }
    return () => {
      _mounted = false;
    };
  }, [updated]);

  useEffect(() => {
    let _mounted = true;

    if (_mounted && !isHost && !!isAdminPost) {
      const check = asyncCheckScreenIsFirst('adminPost', isFirst, storeDispatch);
      if (check) {
        openAdminPostDialog();
      }
    }
    return () => {
      _mounted = false;
    };
  }, [isAdminPost]);

  // scroll to 함수
  const _handleScrollTo = (y: number) => {
    const PLATFORM_Y = Platform.OS === 'ios' ? -(NAV_BAR_HEIGHT + (IS_IPHONE_X ? 40 : theme.size.medium)) : -NAV_BAR_HEIGHT;

    parallaxScrollViewEl.current!.scrollTo({
      x: 0,
      y: PARALLAX_HEADER_HEIGHT + y + PLATFORM_Y,
      animated: true,
    });
  };

  const _handleScrollToCenter = useCallback(() => _handleScrollTo(centerInfoY), [centerInfoY]);
  const _handleScrollToSchedule = useCallback(() => _handleScrollTo(scheduleInfoY), [scheduleInfoY]);

  const _handleOnChangeHeaderVisibility = useCallback((arg: boolean) => {
    setHeaderVisible(arg);
  }, []);

  // * Production:

  if (!data?.getClass) {
    return <Loading origin={`ClassViewScreen_${classId}`} />;
  }

  if (error) {
    reportSentry(error);
    // console.log('classViewQuery error', error);
    // snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return <AccessDenied category={AccessDeniedReason.Error} target={AccessDeniedTarget.Class} navigateRoute={origin} extraInfo={error.message} />;
    // throw error;
  }

  // * 개발용 임시 데이터
  // const { data } = require('../static/devOnly/getClass.json');
  // const loading = false;
  if (data.getClass === null) {
    return <AccessDenied category={AccessDeniedReason.Null} target={AccessDeniedTarget.Class} navigateRoute={origin} />;
  }

  if (!!user && data.getClass.blockedBy && data.getClass.blockedBy.includes(user.username)) {
    return <AccessDenied category={AccessDeniedReason.Blocked} target={AccessDeniedTarget.Class} navigateRoute={origin} />;
  }

  if (!!user && data.getClass.host.blockedUser && data.getClass.host.blockedUser.includes(user.username)) {
    return <AccessDenied category={AccessDeniedReason.UserBlockedBy} target={AccessDeniedTarget.Class} navigateRoute={origin} />;
  }

  if (!!user && data.getClass.host.blockedBy && data.getClass.host.blockedBy.includes(user.username)) {
    return (
      <AccessDenied
        category={AccessDeniedReason.UserBlocked}
        target={AccessDeniedTarget.Class}
        extraInfo={data.getClass.host.name}
        navigateRoute={origin}
      />
    );
  }

  if (data.getClass.host.accountStatus === AccountStatusType.disabled) {
    const mutationFunction = async () => {
      try {
        const input = {
          id: classId,
          classStatus: ClassStatusType.hostDisabled,
        };
        await updateClassStatus({
          variables: { input },
          optimisticResponse: {
            updateClass: {
              __typename: 'Class',
              ...input,
            },
          },
        });
      } catch (e) {
        reportSentry(e);
      }
    };

    return (
      <AccessDenied
        category={AccessDeniedReason.UserDisabled}
        target={AccessDeniedTarget.Class}
        navigateRoute={origin}
        {...(!!user && { mutationFunction, loading: updateClassStatusLoading })}
      />
    );
  }

  const classItem: Partial<GetClassQuery['getClass']> = data.getClass!;
  const { id, classStatus, host, convs, title, extraInfo } = classItem!;

  const numOfConvs = getConvsLength(convs);

  const renderHeader = () => (
    <ClassViewHeader
      item={classItem}
      headerVisible={headerVisible}
      refetch={refetch}
      setWarningProps={setWarningProps}
      isHost={isHost}
      setModalVisible={setModalVisible}
      appearance={appearance}
    />
  );

  const renderForeground = () => (
    <ClassViewCard
      isHost={isHost}
      isAdminPost={isAdminPost}
      classItem={classItem!}
      headerVisible={headerVisible}
      handleCenterClick={_handleScrollToCenter}
      handleScheduleClick={_handleScrollToSchedule}
      setWarningProps={setWarningProps}
      refetch={refetch}
      storeDispatch={storeDispatch}
      setNeedAuthVisible={setNeedAuthVisible}
      openAdminPostDialog={openAdminPostDialog}
    />
  );

  const renderBackground = () => {
    const backgroundStyle = { width: SCREEN_WIDTH, height: PARALLAX_HEADER_HEIGHT };
    return (
      <View style={{}}>
        <FastImage source={bgImage.img} style={backgroundStyle} />
        <LinearGradient
          colors={theme.colors.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.75 }}
          style={[backgroundStyle, styles.parallaxHeaderOpacity]}
        />
      </View>
    );
  };

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

  const _handleDismiss = () => setWarningProps(null);

  return (
    <View style={styles.contentContainerView}>
      <>
        <StatusBarNormal
          appearance={appearance}
          // {...(Platform.OS === 'android' && { barStyle: 'dark-content' })}
          barStyle={
            Platform.OS === 'android'
              ? 'dark-content'
              : appearance === AppearanceType.LIGHT
              ? !headerVisible
                ? 'dark-content'
                : 'light-content'
              : !headerVisible
              ? 'light-content'
              : 'dark-content'
          }
        />

        <ParallaxScrollView
          ref={parallaxScrollViewEl}
          backgroundColor={theme.colors.background}
          // contentBackgroudColor={theme.colors.background}
          onChangeHeaderVisibility={_handleOnChangeHeaderVisibility}
          parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
          {...(headerVisible ? { renderFixedHeader: renderHeader } : { renderStickyHeader: renderHeader })}
          stickyHeaderHeight={Platform.OS === 'ios' ? HEADER_HEIGHT : theme.iconSize.smallThumbnail}
          renderBackground={renderBackground}
          renderForeground={renderForeground}
          fadeOutBackground={true}
          keyboardShouldPersistTaps="always"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
        >
          <ClassViewContent
            item={classItem}
            setCenterInfoY={setCenterInfoY}
            setScheduleInfoY={setScheduleInfoY}
            isHost={isHost}
            isAdminPost={isAdminPost}
            bgCopyright={bgImage.copyright}
            setWarningProps={setWarningProps}
            setModalVisible={setModalVisible}
            appearance={appearance}
          />
        </ParallaxScrollView>

        <SafeAreaView style={styles.safeAreaViewContainger}>
          {isAdminPost && !!extraInfo?.classOrigin ? (
            <AdminContactButtons
              classOrigin={extraInfo?.classOrigin}
              // email={extraInfo?.hostEmail ?? undefined}
              // phone={extraInfo?.hostPhone ?? undefined}
              classStatus={classStatus!}
              // setNeedAuthVisible={setNeedAuthVisible}
              appearance={appearance}
            />
          ) : (
            <ClassViewButtons
              hostId={host!.id}
              hostName={host!.name!}
              classId={id!}
              classTitle={title!}
              classStatus={classStatus!}
              setNeedAuthVisible={setNeedAuthVisible}
              setNeedProfileUpdateVisible={setNeedProfileUpdateVisible}
              handleShare={handleClassShare(classItem, showActionSheetWithOptions, appearance)}
              numOfConvs={numOfConvs}
            />
          )}
        </SafeAreaView>
        {needAuthVisible && (
          <NeedAuthBottomSheet navigation={navigation} setNeedAuthVisible={setNeedAuthVisible} params={{ classId: id }} origin="ClassView" />
        )}
        {!!user && needProfileUpdateVisible && (
          <NeedProfileUpdate
            profileUpdated={profileUpdated}
            setNeedProfileUpdateVisible={setNeedProfileUpdateVisible}
            params={{ origin: 'ClassView', classId: id, hostId: host!.id, userId: user.username, identityId }}
            appearance={appearance}
          />
        )}
      </>

      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      <Portal>
        {!!user && (
          <ReportForm
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            target="클래스"
            targetId={classId!}
            reportTargetType={ReportTargetType.classReport}
            numOfReported={1}
            setWarningProps={setWarningProps}
            submitted={Boolean(warningProps)}
          />
        )}
      </Portal>
      <Portal>
        {warningProps && (
          <WarningDialog
            handleDismiss={_handleDismiss}
            dismissable
            dismissText="아니오"
            visible
            snackbarDispatch={snackbarDispatch}
            origin={origin}
            navigation={navigation}
            appearance={appearance}
            {...warningProps}
          />
        )}
      </Portal>
      <ItemShareVisibleDialog
        itemName={'클래스'}
        suffix={'를'}
        shareVisible={shareVisible}
        setShareVisible={setShareVisible}
        // shareButtonEl={shareButtonEl}
        item={classItem}
        updated={updated}
        appearance={appearance}
      />
    </View>
  );
};

export default ClassViewScreen;
