import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import { AccountStatusType, ConvStatusType } from '../API';
import { Dialog } from 'react-native-paper';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { FunctionComponent, memo, useEffect, useReducer, useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import WarningDialog, { WarningProps } from '../components/WarningDialog';
import { customDeleteChatroom, customGetConv } from '../customGraphqls';
import useChatroomState, { SET_CHATROOM_INIT, SET_CHATROOM_STATE } from '../functions/useChatroomState';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import BackButton from '../components/BackButton';
import Body from '../components/Body';
import { CHAT_WILL_EXPIRE_IN_MONTH } from '../configs/variables';
import ChatBody from '../components/chat/ChatBody';
import ClassInfoBanner from '../components/ClassInfoBanner';
import DeleteButton from '../components/DeleteButton';
import DialogContentText from '../components/DialogContentText';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import Loading from '../components/Loading';
import MyDialogContainer from '../components/MyDialogContainer';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import Right from '../components/Right';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import ShowDisclaimerButton from '../components/ShowDisclaimerButton';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import asyncCheckScreenIsFirst from '../functions/asyncCheckScreenIsFirst';
import getExitroomMessageInput from '../functions/getExitroomMessageInput';
import { getSearchChatroomQueryInput } from '../functions/getSearchChatroomQueryInput';
import gql from 'graphql-tag';
import handleDeleteConv from '../functions/handleDeleteConv';
// import reportSentry from '../functions/reportSentry';
import storeLastChatFocusedTime from '../functions/storeLastChatFocusedTime';

import { getThemeColor } from '../configs/theme';
import useHandleAndroidBack from '../functions/handleAndroidBack';
import { withNavigationFocus } from 'react-navigation';
import ThemedButton from '../components/ThemedButton';
import { getStyles } from '../configs/styles';
import MyDialogTitle from '../components/MyDialogTitle';

interface Props extends NavigationStackScreenProps {
  isFocused: boolean;
}

const GET_CONV = gql(customGetConv);
const DELETE_CONV = gql(customDeleteChatroom);
// const UPDATE_USER_STATE = gql(customUpdateConvUserState);
// const UPDATE_USER_STATE_SUBSCRIPTION = gql(customOnUpdateConvUserState);

const ChatViewScreen: FunctionComponent<any> = ({ navigation, isFocused }: Props) => {
  const {
    authStore: { user, profileName, appState, identityId, isFirst, isInternetReachable, newChats, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);

  if (!user || !isInternetReachable) return <Loading origin="ChatViewScreen-isInternetReachable" />;

  const convId = navigation.getParam('convId');
  const classId = navigation.getParam('classId');
  const hostId = navigation.getParam('hostId');
  const origin = navigation.getParam('origin');
  const type = navigation.getParam('type');
  const navPartner = navigation.getParam('partner');
  // const [updateUserState] = useMutation(UPDATE_USER_STATE);
  const [deleteConv, { loading }] = useMutation(DELETE_CONV);
  const { loading: getConvLoading, data: getConvData, networkStatus: getConvNetworkStatus } = useQuery(GET_CONV, {
    variables: { id: convId },
    fetchPolicy: 'no-cache',
  });

  // const uusUnsubsribe = useSubscription(UPDATE_USER_STATE_SUBSCRIPTION, {
  //   variables: { id: convId },
  //   // skip: !isInternetReachable || appState !== 'active',
  //   // shouldResubscribe: false,
  //   onSubscriptionData: options => {
  //     const { user1state, user2state } = options.subscriptionData.data.onUpdateConvUserState;
  //     const tempState = isHost ? user2state : user1state;
  //     if (tempState !== partnerState) {
  //       chatroomDispatch({ type: SET_CHATROOM_STATE, partnerState: tempState });
  //     }
  //   },
  // });

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const { chatroomState, chatroomDispatch } = useChatroomState();
  const { isFirstTime, chatroomStatus, partner, user1exited, user2exited, onClass } = chatroomState;
  const setIsFirstTime = (arg: boolean) => chatroomDispatch({ type: SET_CHATROOM_STATE, isFirstTime: arg });

  const isHost = !!user && hostId === user.username;
  const amIExited = (isHost && user1exited !== null && user1exited !== 'rejoined') || (!isHost && user2exited !== null && user2exited !== 'rejoined');
  const amIReinvited = (isHost && user1exited === 'reinvited') || (!isHost && user2exited === 'reinvited');

  const _handleBackNavigation = () => {
    setWarningProps(null);

    if (origin && type === 'ClassChatList') {
      // navigation.navigate(origin);
      navigation.navigate(type, { classId: classId, origin });
    } else if (origin === 'ClassView') {
      navigation.navigate(origin);
    } else {
      navigation.navigate('ChatStack');
    }
  };

  const _handleDismiss = () => {
    setIsFirstTime(false);
  };

  useHandleAndroidBack(navigation, _handleBackNavigation);

  // checkFistTIme and show dialog
  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      const check = asyncCheckScreenIsFirst('ChatView', isFirst, storeDispatch);

      if (check) {
        setIsFirstTime(true);
      } else if (isFirstTime) {
        setIsFirstTime(false);
      }
    }
    return () => {
      _mounted = false;
    };
  }, []);

  // ???????????? ?????? ???????????? ????????? ????????? ???????????? ???????????? userNstate ????????????
  // useEffect(() => {
  //   // let _mounted = true;
  //   let didFocusSubscription: any;
  //   let willBlurSubscription: any;

  //   // if (_mounted) {
  //   const _updateUserState = async (event: string) => {
  //     console.log('updateUserState: ', event);
  //     const userKey = isHost ? 'user1state' : 'user2state';
  //     const partnerKey = isHost ? 'user2state' : 'user1state';
  //     const userState = event === 'didFocus' ? 'focused' : new Date().toISOString();

  //     try {
  //       await updateUserState({
  //         variables: {
  //           id: convId,
  //           [userKey]: userState,
  //         },
  //         optimisticResponse: {
  //           __typename: 'Mutation',
  //           updateConvUserState: {
  //             __typename: 'Conv',
  //             id: convId,
  //             [userKey]: userState,
  //             [partnerKey]: partnerState,
  //           },
  //         },
  //       });
  //     } catch (e) {
  //       reportSentry(e);
  //       // console.log('updateUserStateError:', e);
  //     }
  //   };
  //   // };

  //   didFocusSubscription = navigation.addListener('didFocus', payload => {
  //     if (chatroomStatus !== 'noChatroom' && !amIExited && appState === 'active') {
  //       _updateUserState('didFocus');
  //     }
  //   });

  //   willBlurSubscription = navigation.addListener('willBlur', payload => {
  //     console.log('updateUserState willBlurSubscription called');
  //     if (appState !== 'active' || (chatroomStatus !== 'noChatroom' && !amIExited)) {
  //       _updateUserState('willBlur');
  //     }
  //   });

  //   // if (chatroomStatus !== 'noChatroom' && !amIExited) {
  //   //   if (appState === 'active') {
  //   //     console.log('updateUserState isFocused?: ', isFocused);
  //   //     if (isFocused) {
  //   //       _updateUserState('didFocus');
  //   //     } else {
  //   //       _updateUserState('willBlur');
  //   //     }
  //   //   } else {
  //   //     _updateUserState('willBlur');
  //   //   }
  //   // }
  //   // }
  //   return () => {
  //     // _mounted = false;
  //     didFocusSubscription;
  //     willBlurSubscription;
  //   };
  // }, [navigation, appState, chatroomStatus, convId]);

  // newChats ?????? ??? ????????? ??????
  useEffect(() => {
    if (convId && newChats.length > 0 && newChats.includes(convId)) {
      const nextNewChats = newChats.filter((id: string) => id !== convId);
      storeDispatch({ type: SET_AUTHSTORE_STATE, newChats: nextNewChats });
      if (nextNewChats.length === 0) {
        storeLastChatFocusedTime(user?.username ?? '');
      }
    }
  }, [newChats, convId]);

  // ????????? ????????? ???????????? chatroomState dispatch
  useEffect(() => {
    if (getConvNetworkStatus === 7) {
      if (getConvData && getConvData.getConv === null) {
        chatroomDispatch({
          type: SET_CHATROOM_INIT,
          ...(navPartner && { partner: { id: navPartner.id, name: navPartner.name } }),
        });
      } else if (getConvData) {
        const { user1state, user2state, convStatus, blockedBy, user1exited, user2exited, user1, user2, onClass } = getConvData.getConv;

        const partner = isHost ? user2 : user1;
        // const partnerState = isHost ? user2state : user1state;
        chatroomDispatch({
          type: SET_CHATROOM_INIT,
          chatroomStatus: convStatus,
          partner,
          // partnerState,
          onClass,
          ...(blockedBy && { blockedBy }),
          ...(user1exited && { user1exited }),
          ...(user2exited && { user2exited }),
        });
      }
    }
  }, [getConvNetworkStatus]);

  const _handleExitConv = () => {
    const setChatroomStatus = (newStatus: string) => chatroomDispatch({ type: SET_CHATROOM_STATE, chatroomStatus: newStatus });

    const variables =
      type === 'ChatList' ? getSearchChatroomQueryInput(user!.username, null, undefined) : getSearchChatroomQueryInput(null, classId, undefined);
    const messageInput = getExitroomMessageInput(user?.username ?? '', profileName, partner!.id!, convId);

    if (amIExited && !amIReinvited) {
      return _handleBackNavigation;
    } else if (type === 'ChatList' || type === 'ClassChatList') {
      return handleDeleteConv(deleteConv!, convId, snackbarDispatch, variables, messageInput, isHost, setChatroomStatus);
    } else if (type === 'ClassView') {
      return handleDeleteConv(deleteConv!, convId, snackbarDispatch, null, messageInput, isHost, setChatroomStatus);
    } else {
      return _handleBackNavigation;
    }
  };

  // chatroomStatus ???????????? exit ??????
  useEffect(() => {
    if (chatroomStatus === ConvStatusType.exited) {
      let dialogContent = '';
      let reinvited = false;

      if (user1exited === 'reinvited' && !amIExited) {
        reinvited = true;
        dialogContent = '????????? ????????? ?????? ???????????? ?????? ??????????????? ?????? ????????? ???????????????. ?????????????????????????';
      } else {
        const exitedText =
          user1exited && user2exited
            ? '????????? ???????????? ?????? ?????????????????????'
            : amIExited && amIReinvited
            ? '?????? ????????? ?????????????????????, ????????? ?????? ?????? ????????? ?????? ???????????? ???????????????.'
            : amIExited
            ? '?????? ????????? ??????????????????'
            : '????????? ???????????? ?????????????????????';
        dialogContent = `${exitedText} ???????????? ???????????? ????????? ?????? ???????????? ??? ????????????. ?????????????????????????`;
      }

      setWarningProps({
        dialogTitle: '????????? ??????',
        dismissable: false,
        dialogContent,
        handleOk: _handleExitConv(),
        dismissText: reinvited ? '???????????????' : '???????????????',
        okText: '????????????',
        navigateBack: true,
      });
    }
  }, [chatroomStatus]);

  const renderHeader = () => {
    const _handleExitButton = () => {
      setWarningProps({
        dismissable: true,
        dialogTitle: '????????? ?????????',
        dialogContent: '?????? ?????? ??????????????? ????????????. ???????????? ?????? ????????? ??? ????????????. ????????? ??????????????????????',
        handleOk: _handleExitConv(),
        dismissText: '?????????',
        okText: '????????????',
        navigateBack: true,
      });
    };
    const _handleShowDisclaimer = () => setIsFirstTime(true);
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackNavigation} />
        </Left>
        <Body flex={5}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>
            {partner && partner.name}
            {isHost && ' : ?????????'}
          </HeaderTitle>
        </Body>
        <Right>
          <ShowDisclaimerButton needMarginRight onPress={_handleShowDisclaimer} color={getThemeColor('error', appearance)} appearance={appearance} />
          <DeleteButton big exit handleOnPress={_handleExitButton} loading={loading} appearance={appearance} />
        </Right>
      </SwitchStackHeader>
    );
  };

  const renderClassInfo = () => {
    if (chatroomStatus === ConvStatusType.open && onClass) {
      return (
        <ClassInfoBanner
          classTitle={onClass!.title!}
          classId={classId}
          classStatus={onClass!.classStatus!}
          hostId={hostId}
          origin="ChatView"
          convId={convId}
          chatroomDispatch={chatroomDispatch}
          isHost={isHost}
          type={type}
          appearance={appearance}
        />
      );
    }
  };

  if (getConvLoading || !partner) return <Loading origin="ChatViewScreen" />;

  if (!!partner && !!user && partner.accountStatus === AccountStatusType.disabled) {
    return <AccessDenied category={AccessDeniedReason.UserDisabled} target={AccessDeniedTarget.User} navigateRoute={type || origin} />;
  }

  if (!!partner && !!user && partner.blockedUser && partner.blockedUser.includes(user.username)) {
    return <AccessDenied category={AccessDeniedReason.UserBlockedBy} target={AccessDeniedTarget.User} navigateRoute={type || origin} />;
  }

  if (!!partner && !!user && partner.blockedBy && partner.blockedBy.includes(user.username)) {
    return (
      <AccessDenied
        category={AccessDeniedReason.UserBlocked}
        target={AccessDeniedTarget.User}
        extraInfo={partner.name}
        navigateRoute={type || origin}
      />
    );
  }

  const _handleWarningDismiss = () => {
    setWarningProps(null);
  };

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={appearance} />
      {renderHeader()}
      {renderClassInfo()}
      {/* <NavigationEvents
        onWillFocus={payload => console.log('chatview state will focus', payload)}
        onDidFocus={payload => console.log('chatview state did focus', payload)}
        onWillBlur={payload => console.log('chatview state will blur', payload)}
        onDidBlur={payload => console.log('chatview state did blur', payload)}
      /> */}
      <ScrollView contentContainerStyle={styles.flex1} keyboardDismissMode="none" keyboardShouldPersistTaps="handled">
        <ChatBody
          convId={convId}
          classId={classId}
          hostId={hostId}
          isHost={isHost}
          profileName={profileName}
          identityId={identityId}
          chatroomState={chatroomState}
          chatroomDispatch={chatroomDispatch}
          snackbarDispatch={snackbarDispatch}
        />
      </ScrollView>

      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      <NeedAuthBottomSheet navigation={navigation} isFocused={isFocused} />
      {warningProps && (
        <WarningDialog
          {...warningProps}
          handleDismiss={_handleWarningDismiss}
          visible
          snackbarDispatch={snackbarDispatch}
          origin={type}
          navigation={navigation}
          appearance={appearance}
        />
      )}
      <MyDialogContainer visible={isFirstTime} onDismiss={_handleDismiss}>
        <MyDialogTitle>????????? ????????? ?????? ??????</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="??? ???????????? ???????????? ?????? ????????? ???????????? ??????????????? ???????????????. ????????? ????????? ??????, ????????? ??? ????????? ????????? ??????????????? ???????????????." />
          <DialogContentText
            text={`???????????? ?????? ???????????? ${CHAT_WILL_EXPIRE_IN_MONTH}?????? ????????? ?????? ???????????????. ????????? ???????????? ????????? ????????? ?????????`}
            bold
          />
          <DialogContentText text="???????????? ?????? ????????? ?????? ????????? ?????? ??????????????? ????????????." bold warning />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleDismiss}>???????????????</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </SafeAreaView>
  );
};

export default memo(withNavigationFocus(ChatViewScreen));
