import { BackHandler, View } from 'react-native';
import { Dialog } from 'react-native-paper';
import MySnackbar, { OPEN_SNACKBAR, snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { memo, useCallback, useEffect, useReducer } from 'react';
import { customKeywordClasss, customUpdateUserTags } from '../customGraphqls';
import { queryNewClassNotis, updateNewClassNotiStore } from '../functions/manageNewClassNotis';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import useMySubsState, { SET_MY_SUBS_STATE } from '../functions/useMySubsState';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import Body from '../components/Body';
import CancelButton from '../components/CancelButton';
import CancelDialog from '../components/CancelDialog';
import HeaderTitle from '../components/HeaderTitle';
import KoreanParagraph from '../components/KoreanParagraph';
import Left from '../components/Left';
import Loading from '../components/Loading';
import ModalScreenContainer from './ModalScreenContainter';
import MyBanner from '../components/MyBanner';
import MyDialogContainer from '../components/MyDialogContainer';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NotiPermissionDenied from '../components/My/NotiPermissionDenied';
import OneSignal from 'react-native-onesignal';
import Right from '../components/Right';
import { SET_SUBSCRIBED_TAGS } from '../stores/actionTypes';
import SaveButton from '../components/SaveButton';
import SelectTags from '../components/SelectTags';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { USER_TAG_LIMIT } from '../configs/variables';
import asyncCheckScreenIsFirst from '../functions/asyncCheckScreenIsFirst';
import { checkNotifications } from 'react-native-permissions';
import getArrayBeforeAfter from '../functions/getArrayBeforeAfter';
import getTagString from '../functions/getTagString';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

import throttle from 'lodash/throttle';
import { updateTagsCounter } from '../graphql/mutations';
import ThemedButton from '../components/ThemedButton';
import { getThemeColor } from '../configs/theme';
import { getStyles } from '../configs/styles';
import MyDialogTitle from '../components/MyDialogTitle';
import DialogContentText from '../components/DialogContentText';

interface Props extends NavigationStackScreenProps {}

const UPDATE_USER_TAG = gql(customUpdateUserTags);
const UPDATE_TAGS_COUNTER = gql(updateTagsCounter);
const SEARCH_CLASS = gql(customKeywordClasss);

const MySubsScreen = ({ navigation }: Props) => {
  const { mySubsState, mySubsDispatch } = useMySubsState();
  const {
    confirmVisible,
    notiVisible,
    notiSettings,
    cancelVisible,
    bannerVisible,
    updatable,
    selectedTags,
    originalTags,
    toAdd,
    toDelete,
    tagsLoading,
  } = mySubsState;
  const {
    authStore: {
      user: { username },
      subscribedTags,
      oneSignalTags,
      appState,
      isFirst,
      newClassNotis,
      appearance,
    },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);

  const origin = navigation.getParam('origin') || 'MyScreen';

  const [loadingNotis, { called, data, fetchMore, networkStatus, refetch }] = useLazyQuery(SEARCH_CLASS, {
    fetchPolicy: 'network-only',
    // variables,
    // skip: !newClassNotis.lastTime,
  });

  const _handleSetCancelVisible = (bool: boolean) => () =>
    mySubsDispatch({ type: SET_MY_SUBS_STATE, cancelVisible: bool });

  const _handleSetConfirmVisible = (bool: boolean) => () =>
    mySubsDispatch({ type: SET_MY_SUBS_STATE, confirmVisible: bool });

  const _handleSetNotiVisible = (bool: boolean) => () => mySubsDispatch({ type: SET_MY_SUBS_STATE, notiVisible: bool });
  const _handleSetNotiSetting = (bool: boolean) => () =>
    mySubsDispatch({ type: SET_MY_SUBS_STATE, notiSettings: bool });

  const setBannerVisible = useCallback(
    (bool: boolean) => mySubsDispatch({ type: SET_MY_SUBS_STATE, bannerVisible: bool }),
    [mySubsDispatch],
  );
  const setSelectedTags = (tags: string[]) => mySubsDispatch({ type: SET_MY_SUBS_STATE, selectedTags: tags });

  const setCancelVisible = (bool: boolean) => mySubsDispatch({ type: SET_MY_SUBS_STATE, cancelVisible: bool });

  const _handleOnCancel = () => {
    if (origin === 'MyScreen') {
      navigation.goBack();
    } else {
      navigation.navigate(origin);
    }
  };

  const _handleBack = () => {
    // console.log('handleBack', updatable);

    if (updatable) {
      // console.log('log1');
      _handleSetCancelVisible(true)();
    } else {
      // console.log('log2');
      _handleOnCancel();
    }
  };

  // update newClassNotisStore before updating subscribedTags
  useEffect(() => {
    if (!called) {
      if (subscribedTags.length > 0) {
        queryNewClassNotis(loadingNotis, subscribedTags, newClassNotis, 100);
      }
    }
    if (data) {
      updateNewClassNotiStore(data, newClassNotis, subscribedTags, storeDispatch);
    }
  }, [called, data]);

  // android backhandler
  useEffect(() => {
    const backHandlerSubs = BackHandler.addEventListener('hardwareBackPress', () => {
      if (updatable) {
        // console.log('log1');
        _handleSetCancelVisible(true)();
        return true;
      } else {
        // console.log('log2');
        _handleOnCancel();
        return true;
      }
    });
    return () => {
      backHandlerSubs.remove();
    };
  }, [updatable]);

  useEffect(() => {
    let _mounted = true;

    if (_mounted) {
      const check = asyncCheckScreenIsFirst('MySubs', isFirst, storeDispatch);
      if (check) {
        setBannerVisible(true);
      }
    }

    return () => {
      _mounted = false;
    };
  }, []);

  //키워드 알림 설정 체크
  useEffect(() => {
    let _mounted = true;
    if (_mounted && notiSettings && oneSignalTags.optIn === 'false') {
      _handleSetNotiVisible(true)();
    }

    return () => {
      _mounted = false;
    };
  }, [notiSettings]);

  //앱 수신 거절 체크
  useEffect(() => {
    let _mounted = true;

    if (_mounted) {
      (async function() {
        try {
          const notiPermisson = await checkNotifications();
          if (notiPermisson.status === 'granted') {
            _handleSetNotiSetting(true)();
          } else {
            _handleSetNotiSetting(false)();
          }
        } catch (e) {
          reportSentry(e);
        }
      })();
    }

    return () => {
      _mounted = false;
    };
  }, [appState]);

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      const tempTags = subscribedTags || [];
      mySubsDispatch({
        type: SET_MY_SUBS_STATE,
        selectedTags: tempTags,
        originalTags: tempTags,
        tagsLoading: false,
      });
    }
    return () => {
      _mounted = false;
    };
  }, [subscribedTags]);

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      const { toAdd, toDelete } = getArrayBeforeAfter(originalTags, selectedTags);
      mySubsDispatch({
        type: SET_MY_SUBS_STATE,
        toAdd,
        toDelete,
        updatable: toAdd.length !== 0 || toDelete.length !== 0,
      });
    }
    return () => {
      _mounted = false;
    };
  }, [originalTags, selectedTags]);

  const renderHeader = () => {
    const [updateUserTags, { loading: loading1 }] = useMutation(UPDATE_USER_TAG);
    const [updateTags, { loading: loading2 }] = useMutation(UPDATE_TAGS_COUNTER);
    const _handleOnPress = throttle(async () => {
      const nowEpoch = Math.round(new Date().getTime() / 1000);
      let newTags: { [key: string]: string } = {
        optIn: username,
      };

      selectedTags.forEach((tag: string) => {
        // TODO: prod 에서는 삭제 필요
        // const splitTag = tag.split('_')[1];
        newTags[tag] = 'subscribed';
      });
      try {
        if (toAdd.length !== 0 || toDelete.length !== 0) {
          if (toAdd.length !== 0) {
            await updateUserTags({
              variables: {
                input: {
                  id: username,
                  toAdd,
                  lastSubscribedTagsUpdated: nowEpoch,
                },
              },
            });
          }
          if (toDelete.length !== 0) {
            await updateUserTags({
              variables: {
                input: {
                  id: username,
                  toDelete,
                  lastSubscribedTagsUpdated: nowEpoch,
                },
              },
            });
          }
          await updateTags({
            variables: {
              type: 'user',
              ...(toAdd.length !== 0 && { toAdd }),
              ...(toDelete.length !== 0 && { toDelete }),
            },
          });
          if (subscribedTags) {
            subscribedTags.forEach((oldTag: string) => {
              // TODO: prod 에서는 삭제 필요
              // const splitTag = oldTag.split('_')[1];
              OneSignal.deleteTag(oldTag);
            });
          }
          OneSignal.setSubscription(true);

          // console.log(newTags);
          OneSignal.sendTags(newTags);

          storeDispatch({
            type: SET_SUBSCRIBED_TAGS,
            subscribedTags: selectedTags,
            oneSignalTags: { ...oneSignalTags, optIn: username },
            lastSubscribedTagsUpdated: nowEpoch,
          });
          mySubsDispatch({
            type: SET_MY_SUBS_STATE,
            confirmVisible: true,
          });
        }
      } catch (e) {
        reportSentry(e);
        setSelectedTags(originalTags);
        // 에러 snackbar 출력
        snackbarDispatch({
          type: OPEN_SNACKBAR,
          message: '에러가 있습니다. 잠시 후 다시 시도하세요',
        });
      }
    }, 5000);

    return (
      <SwitchStackHeader appearance={appearance} border {...(bannerVisible && styles.opacity01)}>
        <Left>
          <CancelButton onPress={_handleBack} disabled={bannerVisible || cancelVisible} />
        </Left>
        <Body>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>구독 키워드 관리</HeaderTitle>
        </Body>
        <Right>
          <SaveButton
            disabled={!updatable || bannerVisible || cancelVisible}
            loading={loading1 || loading2}
            onPress={_handleOnPress}
            appearance={appearance}
          />
        </Right>
      </SwitchStackHeader>
    );
  };

  const getTags = (tags: Array<string> | undefined) => {
    const string = getTagString(JSON.stringify(tags).replace(/[\["\]]/g, ''));
    return string ? string : '선택한 키워드 없음';
  };

  return (
    <ModalScreenContainer
      children1={
        <>
          {renderHeader()}
          {notiSettings === null ? (
            <Loading origin="MySubsScreen-notiSettings" />
          ) : notiSettings ? (
            <>
              <MyBanner
                // message={`최대 ${USER_TAG_LIMIT}개의 키워드를 구독하실 수 있습니다. 구독하신 키워드에 해당하는 클래스 혹은 정보 게시물이 등록될 경우 푸시 알림을 보내드리며 홈 화면의 새로 등록된 클래스에서도 쉽게 검색이 가능합니다`}
                message={`최대 ${USER_TAG_LIMIT}개의 키워드를 구독하실 수 있습니다. 구독하신 키워드에 정보 게시물이 등록될 경우 푸시 알림을 보내드립니다`}
                label1="알겠습니다"
                visible={bannerVisible}
                disabled={tagsLoading}
                setVisible={setBannerVisible}
              />
              <View
                style={[styles.screenMarginHorizontal, styles.flex1, { ...(bannerVisible && styles.opacity01) }]}
                {...(bannerVisible && { pointerEvents: 'none' })}
              >
                {tagsLoading ? (
                  <Loading origin="MySubsScreen" />
                ) : (
                  <SelectTags
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    snackbarDispatch={snackbarDispatch}
                    isSubsScreen
                    includeRegionTags
                  />
                )}
              </View>
            </>
          ) : (
            <NotiPermissionDenied isMySubsScreen />
          )}

          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
        </>
      }
      children2={
        <>
          <MyDialogContainer visible={confirmVisible} onDismiss={_handleSetConfirmVisible(false)} dismissable={false}>
            <MyDialogTitle>구독 키워드 변경 완료</MyDialogTitle>
            <Dialog.Content>
              {selectedTags.length !== 0 ? (
                <>
                  <DialogContentText bold text={getTags(selectedTags)} />
                  <DialogContentText text="키워드를 성공적으로 구독하였습니다" />
                </>
              ) : (
                <DialogContentText bold text="구독한 키워드가 없습니다" />
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <ThemedButton onPress={_handleOnCancel}>확인</ThemedButton>
            </Dialog.Actions>
          </MyDialogContainer>
          <MyDialogContainer visible={notiVisible} onDismiss={_handleSetNotiVisible(false)} dismissable={false}>
            <MyDialogTitle>구독 키워드 알림 거절 상태</MyDialogTitle>
            <Dialog.Content>
              <KoreanParagraph text="앱 설정에서 구독 키워드 알림을 거절한 상태입니다. 키워드 구독 변경을 완료하시면 알림 수신으로 설정이 변경됩니다" />
            </Dialog.Content>
            <Dialog.Actions>
              <ThemedButton onPress={_handleSetNotiVisible(false)}>확인</ThemedButton>
            </Dialog.Actions>
          </MyDialogContainer>
          <CancelDialog
            cancelVisible={cancelVisible}
            setCancelVisible={setCancelVisible}
            title="구독 키워드 업데이트 중단"
            description="우측 상단의 전송 버튼을 누르지 않고 중단하시면 구독 키워드 업데이트는 이루어지지 않습니다."
            onCancel={_handleOnCancel}
            appearance={appearance}
          />
        </>
      }
    />
  );
};

export default memo(MySubsScreen);
