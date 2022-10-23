import { BackHandler, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { CHANGE_AUTH_STATE, SET_ONESIGNAL_TAGS } from '../stores/actionTypes';
import MySnackbar, { OPEN_SNACKBAR, snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { NavigationFocusInjectedProps, withNavigationFocus } from 'react-navigation';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import WarningDialog, { WarningProps } from '../components/WarningDialog';
import { customGetUserProfile, updateUserSettings } from '../customGraphqls';
import { useMutation, useQuery } from '@apollo/react-hooks';
import useSettingsState, { SET_SETTINGS_STATE } from '../functions/useSettingsState';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import AndroidDivider from '../components/AndroidDivider';
import BackButton from '../components/BackButton';
import Body from '../components/Body';
import DeviceInfo from 'react-native-device-info';
import { HOMEPAGE_URL } from '../configs/variables';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import { List } from 'react-native-paper';
import Loading from '../components/Loading';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import NotiPermissionDenied from '../components/My/NotiPermissionDenied';
import OneSignal from 'react-native-onesignal';
import Right from '../components/Right';
import RightIcon from '../components/My/RightIcon';
import SaveButton from '../components/SaveButton';
import SettingSwitch from '../components/My/SettingSwitch';
import StatusBarNormal from '../components/StatusBarNormal';
import StoreRatings from '../components/My/StoreRatings';
import SubHeaderText from '../components/SubHeaderText';
import SwitchStackHeader from '../components/SwitchStackHeader';
import ThickDivider from '../components/ThickDivider';
import _handleAppShare from '../components/My/AppShare';
import { checkNotifications } from 'react-native-permissions';
import codePush from 'react-native-code-push';
import getFormURL from '../functions/getFormURL';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';
import showCodePushDialog from '../functions/showCodePushDialog';
import { getStyles } from '../configs/styles';
import { getTheme, getThemeColor } from '../configs/theme';
import { allPromisesSettled } from '../functions/allPromisesSettled';

interface Props extends NavigationFocusInjectedProps {}
const GET_USER_PROFILE = gql(customGetUserProfile);
const UPDATE_USER_SETTINGS = gql(updateUserSettings);

const MySettingsScreen = ({ navigation, isFocused }: Props) => {
  const {
    authStore: { user, authInfo, oneSignalTags, appState, appearance },
  } = useStoreState();

  if (!user) return null;

  const styles = getStyles(appearance);
  const theme = getTheme(appearance);

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const { settingsState, settingsDispatch } = useSettingsState();

  const { buildNumber, deviceInfo, codePushVersion, updateAvailable, updated, appNotiPermission } = settingsState;
  const storeDispatch = useStoreDispatch();
  const isThirdPartyUser = !!user && (user.username.startsWith('Kakao_') || user.username.startsWith('Apple_'));
  const isNotiDenied = appNotiPermission !== 'granted';
  const { data, networkStatus } = useQuery(GET_USER_PROFILE, {
    skip: !user,
    variables: { id: !!user ? user.username : '' },
  });
  const [updateUserSettings, { loading }] = useMutation(UPDATE_USER_SETTINGS);

  useEffect(() => {
    let _mounted = true;
    if (!!user && appState === 'active' && isFocused) {
      (() => {
        let buildNumber = DeviceInfo.getVersion();
        let deviceInfo = `${DeviceInfo.getBrand()}_${DeviceInfo.getDeviceId()}_${DeviceInfo.getSystemVersion()}`;
        // let appNotiPermission;
        // let codePushVersion;
        // let updateAvailable;

        allPromisesSettled([
          checkNotifications(),
          !__DEV__ ? codePush.getUpdateMetadata(0) : null,
          !__DEV__ ? codePush.checkForUpdate() : null,
        ])
          .then(([{ value: notiSettings }, { value: localPackage }, { value: remotePackage }]) => {
            if (_mounted) {
              settingsDispatch({
                type: SET_SETTINGS_STATE,
                buildNumber,
                deviceInfo,
                optIn: oneSignalTags.optIn !== 'false',
                messageOptIn: oneSignalTags.messageOptIn !== 'false',
                reviewOptIn: oneSignalTags.reviewOptIn !== 'false',
                commOptIn: oneSignalTags.commOptIn !== 'false',
                // appNotiPermission,
                // codePushVersion,
                // updateAvailable,
                appNotiPermission: notiSettings?.status ?? 'unavailable',
                codePushVersion: !localPackage ? '' : localPackage.label,
                updateAvailable: !!remotePackage,
                updated: false,
              });
            }
          })
          .catch(e => reportSentry(e));
      })();
    }
    return () => {
      _mounted = false;
    };
  }, [appState, isFocused]);

  useEffect(() => {
    if (networkStatus === 7) {
      const { privacyManners, privacyResume } = data.getUser.settings;
      settingsDispatch({
        type: SET_SETTINGS_STATE,
        privacyManners,
        privacyResume,
        updated: false,
      });
    }
  }, [networkStatus]);

  const _handleNavBackButton = () => {
    navigation.goBack();
  };

  const _handleOnPressBackButton = () => {
    if (!updated) {
      _handleNavBackButton();
    } else {
      setWarningProps({
        visible: true,
        dismissable: true,
        dialogTitle: '설정 업데이트 중단',
        dialogContent: `설정 변경 사항이 있습니다. 우측의 전송 버튼을 터치하여 변경 사항을 전송하세요. 중단하고 돌아가시려면 '중단'을 터치하세요`,
        handleOk: _handleNavBackButton,
        okText: '중단',
      });
    }
  };

  //android back handler
  useEffect(() => {
    const backHandlerSubs = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!updated) {
        _handleNavBackButton();
        return true;
      } else {
        setWarningProps({
          visible: true,
          dismissable: true,
          dialogTitle: '설정 업데이트 중단',
          dialogContent: `설정 변경 사항이 있습니다. 우측의 전송 버튼을 터치하여 변경 사항을 전송하세요. 중단하고 돌아가시려면 '중단'을 터치하세요`,
          handleOk: _handleNavBackButton,
          okText: '중단',
        });
        return true;
      }
    });
    return () => {
      backHandlerSubs.remove();
    };
  }, [updated]);

  const _handleOnDismiss = () => {
    setWarningProps(null);
  };

  const _handleUpdateSettings = async () => {
    // console.log(settingsState);
    try {
      const newTags = {
        optIn: settingsState.optIn ? user.username : 'false',
        messageOptIn: settingsState.messageOptIn ? user.username : 'false',
        reviewOptIn: settingsState.reviewOptIn ? user.username : 'false',
        commOptIn: settingsState.commOptIn ? user.username : 'false',
      };
      const updateInput = {
        id: user.username,
        privacyManners: settingsState.privacyManners,
        privacyResume: settingsState.privacyResume,
      };
      OneSignal.sendTags(newTags);
      storeDispatch({
        type: SET_ONESIGNAL_TAGS,
        oneSignalTags: {
          ...oneSignalTags,
          ...newTags,
        },
      });
      await updateUserSettings({
        variables: updateInput,
        optimisticResponse: {
          __typename: 'Mutation',
          updateUserSettings: {
            __typename: 'User',
            id: user.username,
            settings: {
              __typename: 'Settings',
              privacyManners: settingsState.privacyManners,
              privacyResume: settingsState.privacyResume,
            },
          },
        },
      });
      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: '설정 업데이트 성공',
        sideEffect: () =>
          settingsDispatch({
            type: SET_SETTINGS_STATE,

            updated: false,
          }),
        duration: 500,
      });
    } catch (e) {
      reportSentry(e);
      snackbarDispatch({ type: OPEN_SNACKBAR, message: '업데이트 실패, 잠시 후 다시 시도하세요', duration: 500 });
    }
    //* to do
  };

  const renderHeader = useMemo(() => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleOnPressBackButton} />
        </Left>
        <Body>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>설정</HeaderTitle>
        </Body>
        <Right>
          <SaveButton onPress={_handleUpdateSettings} disabled={!updated} loading={loading} appearance={appearance} />
        </Right>
      </SwitchStackHeader>
    );
  }, [updated, loading, appearance]);

  const renderBody = () => {
    const _handleNav = (route: string, params?: object) => () => navigation.push(route, params);

    const _handlePasswordChange = () => {
      storeDispatch({
        type: CHANGE_AUTH_STATE,
        authState: 'changePassword',
        authInfo: { ...authInfo, origin: 'MySettings' },
      });
      _handleNav('Auth')();
    };
    const _handleURL = (url: string, title: string, runJs?: string) => () =>
      navigation.navigate('WebView', { url, title, runJs });

    const _handleUpdate = () => {
      codePush.disallowRestart();
      codePush.sync(
        {
          updateDialog: {
            title: '업데이트 알림',
            optionalUpdateMessage: '업데이트가 있습니다. 설치하시겠습니까?',
            optionalInstallButtonLabel: '설치',
            optionalIgnoreButtonLabel: '무시',
            appendReleaseDescription: true,
            descriptionPrefix: '업데이트사항: ',
          },
          installMode: codePush.InstallMode.IMMEDIATE,
        },
        showCodePushDialog,
      );
    };

    const renderRightIcon = (props: any) => () => <RightIcon color={props.color} icon={props.icon} />;

    const renderVersionInfo = useMemo(
      () => () => {
        const versionText = `${buildNumber}`.concat(codePushVersion ? ` / ${codePushVersion}` : '');
        return (
          <Text
            style={{ fontWeight: '600', alignSelf: 'center', marginRight: theme.size.normal, color: theme.colors.text }}
          >
            {versionText}
          </Text>
        );
      },
      [buildNumber, codePushVersion],
    );

    const renderSwitch = (value: string) => () => (
      <SettingSwitch
        status={settingsState[value]}
        value={value}
        settingsDispatch={settingsDispatch}
        appearance={appearance}
      />
    );

    if (!data || !data.getUser) {
      return <Loading origin="MySettingsScreen" />;
    }

    // if (!user) {
    //   navigation.navigate('Home');
    //   return null;
    // }

    return (
      <ScrollView>
        <View style={styles.categoryContainer}>
          <SubHeaderText appearance={appearance}>앱 정보</SubHeaderText>

          <List.Item
            title="현재 버젼"
            style={styles.categoryListItem}
            right={renderVersionInfo}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          {!__DEV__ && (
            <List.Item
              title="앱 업데이트"
              description={
                updateAvailable ? '원활한 사용을 위해 앱 업데이트를 실행하세요' : '현재 가능한 업데이트가 없습니다'
              }
              style={styles.categoryListItem}
              onPress={updateAvailable ? _handleUpdate : undefined}
              right={
                updateAvailable ? renderRightIcon({ icon: 'system-update', color: theme.colors.focus }) : undefined
              }
              titleStyle={{
                fontWeight: updateAvailable ? 'bold' : 'normal',
                color: updateAvailable ? theme.colors.focus : theme.colors.backdrop,
              }}
              descriptionStyle={styles.listItemDescription}
            />
          )}
        </View>

        <AndroidDivider needMarginHorizontal />

        <View style={styles.categoryContainer}>
          <SubHeaderText appearance={appearance}>알림 설정</SubHeaderText>
          {appNotiPermission === null ? (
            <View style={[styles.fullWidth, styles.containerMarginVertical]}>
              <Loading auth size="small" />
            </View>
          ) : isNotiDenied ? (
            <NotiPermissionDenied />
          ) : (
            <>
              <List.Item
                title="구독 키워드 알림"
                description={settingsState.optIn ? '알림을 수신하고 있습니다' : '알림을 받지 수신하지 않습니다'}
                style={styles.categoryListItem}
                right={renderSwitch('optIn')}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
              />
              {/* <List.Item
                title="채팅방 메시지 알림"
                description={settingsState.messageOptIn ? '알림을 수신하고 있습니다' : '알림을 받지 수신하지 않습니다'}
                style={styles.categoryListItem}
                right={renderSwitch('messageOptIn')}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
              /> */}
              <List.Item
                title="게시판 댓글 등 알림"
                description={settingsState.reviewOptIn ? '알림을 수신하고 있습니다' : '알림을 받지 수신하지 않습니다'}
                style={styles.categoryListItem}
                right={renderSwitch('commOptIn')}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
              />
              <List.Item
                title="기타 알림 (리뷰 작성 알림 등)"
                description={settingsState.reviewOptIn ? '알림을 수신하고 있습니다' : '알림을 받지 수신하지 않습니다'}
                style={styles.categoryListItem}
                right={renderSwitch('reviewOptIn')}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
              />
            </>
          )}
        </View>
        <AndroidDivider needMarginHorizontal />
        <View style={styles.categoryContainer}>
          <SubHeaderText appearance={appearance}>프라이버시 설정</SubHeaderText>
          <List.Item
            title="이력서 링크 공개"
            description={settingsState.privacyResume ? '모든 유저에게 공개하고 있습니다' : '채팅 상대에게만 공개합니다'}
            style={styles.categoryListItem}
            right={renderSwitch('privacyResume')}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="비매너 리뷰 내용 공개"
            description={settingsState.privacyManners ? '내용까지 모두 공개하고 있습니다' : '점수/횟수만 공개합니다'}
            style={styles.categoryListItem}
            right={renderSwitch('privacyManners')}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </View>
        <AndroidDivider needMarginHorizontal />
        <View style={styles.categoryContainer}>
          <SubHeaderText appearance={appearance}>계정 설정</SubHeaderText>
          {!isThirdPartyUser && (
            <List.Item
              title="비밀번호 변경"
              style={styles.categoryListItem}
              onPress={_handlePasswordChange}
              right={renderRightIcon({})}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
          )}
          <List.Item
            title="탈퇴 요청"
            description="계정 사용을 중지합니다"
            style={styles.categoryListItem}
            onPress={_handleNav('DisableUser')}
            right={renderRightIcon({})}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </View>
        <ThickDivider appearance={appearance} />

        <List.Item
          title="고객 문의"
          style={styles.listItem}
          onPress={_handleURL(getFormURL(user.attributes.email, `${deviceInfo}`), '고객 문의')}
          right={renderRightIcon({})}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="공지사항"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}category/notice/`, '공지사항')}
          right={renderRightIcon({ icon: 'explore', color: theme.colors.indigo700 })}
          titleStyle={styles.listItemTitle}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="이벤트"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}category/events/`, '이벤트')}
          right={renderRightIcon({ icon: 'explore', color: theme.colors.indigo700 })}
          titleStyle={styles.listItemTitle}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="사용자 약관"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}terms/`, '사용자 약관')}
          right={renderRightIcon({ icon: 'explore', color: theme.colors.indigo700 })}
          titleStyle={styles.listItemTitle}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="개인 정보 처리 방침"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}privacystatements/`, '개인 정보 처리 방침')}
          right={renderRightIcon({ icon: 'explore', color: theme.colors.indigo700 })}
          titleStyle={styles.listItemTitle}
        />
        <AndroidDivider needMarginHorizontal />
        {/* <List.Item
          title="오픈 소스 사용 정보"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}app/openSourceInfo/`, '오픈 소스 사용 정보')}
          right={renderRightIcon({})}
          titleStyle={styles.listItemTitle}
        />
        <ThickDivider appearance={appearance} /> */}
        <StoreRatings appearance={appearance} />
      </ScrollView>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.contentContainerView}>
        <StatusBarNormal appearance={appearance} />
        {renderHeader}

        {!!user && renderBody()}

        {warningProps && (
          <WarningDialog
            {...warningProps}
            handleDismiss={_handleOnDismiss}
            dismissable
            dismissText="아니오"
            visible
            snackbarDispatch={snackbarDispatch}
            origin="MySettings"
            navigation={navigation}
            appearance={appearance}
          />
        )}
      </SafeAreaView>
      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />

      <NeedAuthBottomSheet navigation={navigation} isFocused={isFocused} />
    </>
  );
};

export default withNavigationFocus(MySettingsScreen);
