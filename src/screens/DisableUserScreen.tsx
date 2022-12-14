import * as Yup from 'yup';

import { Dialog, Menu } from 'react-native-paper';
import { Formik, FormikValues } from 'formik';
import { Keyboard, SafeAreaView as NativeSafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import MySnackbar, { OPEN_SNACKBAR, snackbarInitialState, snackbarReducer } from '../components/MySnackbar';

import React, { useEffect, useReducer, useState } from 'react';
import { adminDisableUser, reportSendMail } from '../graphql/mutations';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import AndroidDivider from '../components/AndroidDivider';
import Body from '../components/Body';
import CancelButton from '../components/CancelButton';
import HeaderTitle from '../components/HeaderTitle';
import KeyboardDismissButton from '../components/KeyboardDismissButton';
import KoreanParagraph from '../components/KoreanParagraph';
import Left from '../components/Left';
import MenuAnchorText from '../components/MenuAnchorText';
import MyDialogContainer from '../components/MyDialogContainer';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import NextProcessButton from '../components/NextProcessButton';
import OneSignal from 'react-native-onesignal';
import RNKakao from 'rn-kakao-login';
import { ReportTargetType } from '../API';
import ResetFormButton from '../components/ResetFormButton';
import Right from '../components/Right';
import { SafeAreaView } from 'react-navigation';
import SingleLineInputField from '../components/SingleLineInputField';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';

import disconnectKakaoUser from '../functions/disconnectKakaoUser';
import getFormURL from '../functions/getFormURL';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

import { getThemeColor } from '../configs/theme';
import { throttle } from 'lodash';
import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useMutation } from '@apollo/react-hooks';
import userSignOut from '../functions/userSignOut';
import { withNavigationFocus } from 'react-navigation';
import { withNextInputAutoFocusForm } from 'react-native-formik';
import ThemedButton from '../components/ThemedButton';
import { getStyles } from '../configs/styles';
import { getCompStyles } from '../configs/compStyles';
import MyDialogTitle from '../components/MyDialogTitle';

const Form = withNextInputAutoFocusForm(View);

interface Props extends NavigationStackScreenProps {}

const validationSchema = Yup.object().shape({
  extraInfo: Yup.string()
    .max(100, '100??? ????????? ???????????????')
    .required('????????????????????? ????????? ??????????????????'),
});

const DISABLE_USER = gql(adminDisableUser);
const REPORT_SEND_MAIL = gql(reportSendMail);

// const resetAction = StackActions.reset({
//   index: 0,
//   actions: [NavigationActions.navigate({ routeName: 'Auth' })],
// });

const DisableUserScreen = ({ navigation }: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const styles = getStyles(appearance);
  const compStyles = getCompStyles(appearance);

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const [dialogVisible, setDialogVisible] = useState<string | null>('needWarning');
  const [reportMail, { loading: loading1 }] = useMutation(REPORT_SEND_MAIL);
  const [disableUser, { loading: loading2 }] = useMutation(DISABLE_USER);

  const storeDispatch = useStoreDispatch();
  const isThirdPartyUser = !!user && (user.username.startsWith('Kakao_') || user.username.startsWith('Apple_'));
  // firebase analytics
  // const { state } = navigation;
  // const screenName = `${state.routeName}`;
  // firebase.analytics().setCurrentScreen(screenName);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && !user) {
      navigation.navigate('Home');
      // navigation.dispatch(resetAction);
    }
    return () => {
      _mounted = false;
    };
  }, [user]);

  const _handleBackButton = () => navigation.navigate('MySettings');

  useHandleAndroidBack(navigation, _handleBackButton);

  const _handleAsk = () => {
    const _handleURL = (url: string, title: string, reroute?: boolean) => () =>
      navigation.navigate('WebView', { url, title, reroute });
    // setDialogVisible(null);
    _handleURL(getFormURL(user.attributes.email, '?????? ??? ??????'), '?????? ??????', true)();
  };
  const renderHeader = () => {
    const _handleOnCancel = () => {
      Keyboard.dismiss();
      _handleBackButton();
    };

    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <CancelButton onPress={_handleOnCancel} />
        </Left>
        <Body>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>?????? ??????</HeaderTitle>
        </Body>
        <Right>
          <KeyboardDismissButton />
        </Right>
      </SwitchStackHeader>
    );
  };

  const _handleMenuDismiss = () => setMenuVisible(false);
  const _handleMenuOpen = () => setMenuVisible(true);
  const _handleDialogVisible = (state: string) => () => setDialogVisible(state);

  const _handleSubmit = (values: FormikValues) => {
    Keyboard.dismiss();
    const reportFunction = throttle(async () => {
      try {
        await reportMail({
          variables: {
            input: {
              reporterId: user.username,
              reportCategory,
              reportTargetType: ReportTargetType.disableUser,
              targetId: user.username,
              extraInfo: values.extraInfo,
            },
          },
        });

        OneSignal.setSubscription(false);
        await disableUser({
          variables: { userId: user.username },
        });

        if (isThirdPartyUser) {
          try {
            // console.log('KakaoUser disabling start');
            const result = await RNKakao.userInfo();
            // console.log(result);

            await disconnectKakaoUser(result.accessToken);
          } catch (e) {
            reportSentry(e);
          } finally {
            userSignOut(storeDispatch, navigation);
          }
        } else {
          userSignOut(storeDispatch, navigation);
        }
      } catch (e) {
        snackbarDispatch({ type: OPEN_SNACKBAR, message: '?????? ??????, ?????? ??? ?????? ???????????????' });
        reportSentry(e);
      }
    }, 1000);

    reportFunction();
  };

  return (
    <SafeAreaView style={[styles.contentContainerView, styles.darkBackgroundColor]}>
      <StatusBarNormal appearance={appearance} barStyle={'light-content'} switchScreen />

      {renderHeader()}

      <NativeSafeAreaView
        style={[styles.screenPaddingHorizontal, styles.backgroundColor, styles.containerBottomRadius]}
      >
        <ScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}
          alwaysBounceVertical={false}
          // contentContainerStyle={styles.containerMarginTop}
        >
          {!!user && (
            <>
              <Menu
                visible={menuVisible}
                onDismiss={_handleMenuDismiss}
                anchor={
                  <TouchableOpacity onPress={_handleMenuOpen} style={styles.containerMarginTop}>
                    <MenuAnchorText appearance={appearance}>
                      ?????? ??????: {reportCategory || '???????????? ??????????????? (??????)'}
                    </MenuAnchorText>
                  </TouchableOpacity>
                }
                contentStyle={{
                  backgroundColor: getThemeColor('uiBackground', appearance),
                }}
              >
                <Menu.Item
                  onPress={() => {
                    setReportCategory('????????? ??????');
                    setMenuVisible(false);
                  }}
                  title="????????? ??????"
                  titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
                />
                <Menu.Item
                  onPress={() => {
                    setReportCategory('????????? ??????');
                    setMenuVisible(false);
                  }}
                  title="????????? ??????"
                  titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
                />
                <Menu.Item
                  onPress={() => {
                    setReportCategory('????????? ?????????');
                    setMenuVisible(false);
                  }}
                  title="????????? ?????????"
                  titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
                />

                <Menu.Item
                  onPress={() => {
                    setReportCategory('?????? ??????');
                    setMenuVisible(false);
                  }}
                  title="?????? ??????"
                  titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
                />
                <Menu.Item
                  onPress={() => {
                    setReportCategory('?????? ??????');
                    setMenuVisible(false);
                  }}
                  title="?????? ??????"
                  titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
                />
                <Menu.Item
                  onPress={() => {
                    setReportCategory('??????');
                    setMenuVisible(false);
                  }}
                  title="??????"
                  titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
                />
              </Menu>
              <AndroidDivider needMarginVertical />
              <Formik
                validateOnChange={true}
                validateOnBlur={true}
                validateOnMount={true}
                initialValues={{
                  extraInfo: '',
                }}
                onSubmit={values => _handleSubmit(values)}
                validationSchema={validationSchema}
              >
                {props => {
                  const _handleResetForm = () => {
                    props.resetForm({ values: { extraInfo: '' } });
                    setReportCategory('');
                  };
                  const noError: Boolean = Object.entries(props.errors).length === 0;

                  return (
                    // <View style={styles.flex1}>
                    <Form style={compStyles.form}>
                      <SingleLineInputField
                        labelText="?????? ??????"
                        name="extraInfo"
                        type="string"
                        multiline={true}
                        // height={150}
                        maxLength={100}
                        autoCorrect={false}
                        style={{ height: 150 }}
                        placeholder="?????????????????? ????????? ?????? 100??? ????????? ????????? ?????????(??????)"
                      />

                      {/* <View style={styles.flex1} /> */}
                      <View style={compStyles.pressButtonsInARow}>
                        {props.values.extraInfo !== '' && <ResetFormButton onPress={_handleResetForm} />}

                        <NextProcessButton
                          mode="contained"
                          children={reportCategory ? '?????? ?????? ??????' : '?????? ????????? ???????????????'}
                          onPress={props.handleSubmit}
                          marginHorizontalNeedless
                          containerStyle={compStyles.flex1}
                          disabled={!reportCategory || !noError}
                          color={getThemeColor('error', appearance)}
                          loading={loading1 || loading2 || props.isSubmitting || (props.isValidating && !props.errors)}
                        />
                      </View>
                    </Form>
                    // </View>
                  );
                }}
              </Formik>
            </>
          )}
        </ScrollView>
        <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      </NativeSafeAreaView>

      <NeedAuthBottomSheet navigation={navigation} />

      <MyDialogContainer
        visible={dialogVisible === 'needWarning'}
        onDismiss={_handleDialogVisible('checked')}
        dismissable
      >
        <MyDialogTitle>????????? ?????????~</MyDialogTitle>
        <Dialog.Content>
          <KoreanParagraph
            text="??????????????? ????????????????????????? ??????????????? ???????????? ????????? ???????????? ?????? ???????????? ?????????, ??? ????????? ????????? ????????? ?????????."
            textStyle={styles.dialogContentWarningText}
          />
          {isThirdPartyUser && (
            <KoreanParagraph
              text="????????? ????????? ???????????? ????????? ????????? ????????? ????????? ???????????? ???????????? ???????????????"
              textStyle={styles.dialogContentWarningText}
            />
          )}
          <KoreanParagraph
            text="???????????? ?????? ????????? ???????????? ????????? ???????????? ?????? ??????????????? ????????? ?????????"
            textStyle={styles.dialogContentWarningText}
            paragraphStyle={styles.containerMarginTop}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleAsk}>????????????</ThemedButton>
          <ThemedButton onPress={_handleDialogVisible('checked')} color={getThemeColor('error', appearance)}>
            ??????
          </ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </SafeAreaView>
  );
};

export default withNavigationFocus(DisableUserScreen);
