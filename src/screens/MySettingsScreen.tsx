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
        dialogTitle: '?????? ???????????? ??????',
        dialogContent: `?????? ?????? ????????? ????????????. ????????? ?????? ????????? ???????????? ?????? ????????? ???????????????. ???????????? ?????????????????? '??????'??? ???????????????`,
        handleOk: _handleNavBackButton,
        okText: '??????',
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
          dialogTitle: '?????? ???????????? ??????',
          dialogContent: `?????? ?????? ????????? ????????????. ????????? ?????? ????????? ???????????? ?????? ????????? ???????????????. ???????????? ?????????????????? '??????'??? ???????????????`,
          handleOk: _handleNavBackButton,
          okText: '??????',
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
        message: '?????? ???????????? ??????',
        sideEffect: () =>
          settingsDispatch({
            type: SET_SETTINGS_STATE,

            updated: false,
          }),
        duration: 500,
      });
    } catch (e) {
      reportSentry(e);
      snackbarDispatch({ type: OPEN_SNACKBAR, message: '???????????? ??????, ?????? ??? ?????? ???????????????', duration: 500 });
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
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>??????</HeaderTitle>
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
            title: '???????????? ??????',
            optionalUpdateMessage: '??????????????? ????????????. ?????????????????????????',
            optionalInstallButtonLabel: '??????',
            optionalIgnoreButtonLabel: '??????',
            appendReleaseDescription: true,
            descriptionPrefix: '??????????????????: ',
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
          <SubHeaderText appearance={appearance}>??? ??????</SubHeaderText>

          <List.Item
            title="?????? ??????"
            style={styles.categoryListItem}
            right={renderVersionInfo}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          {!__DEV__ && (
            <List.Item
              title="??? ????????????"
              description={
                updateAvailable ? '????????? ????????? ?????? ??? ??????????????? ???????????????' : '?????? ????????? ??????????????? ????????????'
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
          <SubHeaderText appearance={appearance}>?????? ??????</SubHeaderText>
          {appNotiPermission === null ? (
            <View style={[styles.fullWidth, styles.containerMarginVertical]}>
              <Loading auth size="small" />
            </View>
          ) : isNotiDenied ? (
            <NotiPermissionDenied />
          ) : (
            <>
              <List.Item
                title="?????? ????????? ??????"
                description={settingsState.optIn ? '????????? ???????????? ????????????' : '????????? ?????? ???????????? ????????????'}
                style={styles.categoryListItem}
                right={renderSwitch('optIn')}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
              />
              {/* <List.Item
                title="????????? ????????? ??????"
                description={settingsState.messageOptIn ? '????????? ???????????? ????????????' : '????????? ?????? ???????????? ????????????'}
                style={styles.categoryListItem}
                right={renderSwitch('messageOptIn')}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
              /> */}
              <List.Item
                title="????????? ?????? ??? ??????"
                description={settingsState.reviewOptIn ? '????????? ???????????? ????????????' : '????????? ?????? ???????????? ????????????'}
                style={styles.categoryListItem}
                right={renderSwitch('commOptIn')}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
              />
              <List.Item
                title="?????? ?????? (?????? ?????? ?????? ???)"
                description={settingsState.reviewOptIn ? '????????? ???????????? ????????????' : '????????? ?????? ???????????? ????????????'}
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
          <SubHeaderText appearance={appearance}>??????????????? ??????</SubHeaderText>
          <List.Item
            title="????????? ?????? ??????"
            description={settingsState.privacyResume ? '?????? ???????????? ???????????? ????????????' : '?????? ??????????????? ???????????????'}
            style={styles.categoryListItem}
            right={renderSwitch('privacyResume')}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="????????? ?????? ?????? ??????"
            description={settingsState.privacyManners ? '???????????? ?????? ???????????? ????????????' : '??????/????????? ???????????????'}
            style={styles.categoryListItem}
            right={renderSwitch('privacyManners')}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </View>
        <AndroidDivider needMarginHorizontal />
        <View style={styles.categoryContainer}>
          <SubHeaderText appearance={appearance}>?????? ??????</SubHeaderText>
          {!isThirdPartyUser && (
            <List.Item
              title="???????????? ??????"
              style={styles.categoryListItem}
              onPress={_handlePasswordChange}
              right={renderRightIcon({})}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
          )}
          <List.Item
            title="?????? ??????"
            description="?????? ????????? ???????????????"
            style={styles.categoryListItem}
            onPress={_handleNav('DisableUser')}
            right={renderRightIcon({})}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </View>
        <ThickDivider appearance={appearance} />

        <List.Item
          title="?????? ??????"
          style={styles.listItem}
          onPress={_handleURL(getFormURL(user.attributes.email, `${deviceInfo}`), '?????? ??????')}
          right={renderRightIcon({})}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="????????????"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}category/notice/`, '????????????')}
          right={renderRightIcon({ icon: 'explore', color: theme.colors.indigo700 })}
          titleStyle={styles.listItemTitle}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="?????????"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}category/events/`, '?????????')}
          right={renderRightIcon({ icon: 'explore', color: theme.colors.indigo700 })}
          titleStyle={styles.listItemTitle}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="????????? ??????"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}terms/`, '????????? ??????')}
          right={renderRightIcon({ icon: 'explore', color: theme.colors.indigo700 })}
          titleStyle={styles.listItemTitle}
        />
        <AndroidDivider needMarginHorizontal />
        <List.Item
          title="?????? ?????? ?????? ??????"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}privacystatements/`, '?????? ?????? ?????? ??????')}
          right={renderRightIcon({ icon: 'explore', color: theme.colors.indigo700 })}
          titleStyle={styles.listItemTitle}
        />
        <AndroidDivider needMarginHorizontal />
        {/* <List.Item
          title="?????? ?????? ?????? ??????"
          style={styles.listItem}
          onPress={_handleURL(`${HOMEPAGE_URL}app/openSourceInfo/`, '?????? ?????? ?????? ??????')}
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
            dismissText="?????????"
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
