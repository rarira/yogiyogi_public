import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import { HeaderTitle, NavigationStackScreenProps } from 'react-navigation-stack';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { SafeAreaView as NativeSafeAreaView, TextInput, View } from 'react-native';
import React, { useReducer, useRef, useState } from 'react';
import WarningDialog, { WarningProps } from '../components/WarningDialog';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import BackButton from '../components/BackButton';
import BackToPostButton from '../components/comm/BackToPostButton';
import Body from '../components/Body';
import { CANCEL_COMMENT_INPUT } from '../stores/actionTypes';
import CancelInputActionButton from '../components/comm/CancelInputActionButton';
import CommentCard from '../components/comm/CommentCard';
import KeyboardDismissButton from '../components/KeyboardDismissButton';
import Left from '../components/Left';
import Loading from '../components/Loading';
import NeedProfileUpdate from '../components/NeedProfileUpdate';
import { Portal } from 'react-native-paper';
import PostCommentInput from '../components/comm/PostCommentInput';
import PostCommentsByThread from '../components/comm/PostCommentsByThread';
import Right from '../components/Right';
import { SafeAreaView } from 'react-navigation';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { customGetComment } from '../customGraphqls';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';
import gql from 'graphql-tag';
import guestClient from '../configs/guestClient';
import reportSentry from '../functions/reportSentry';
import { useQuery } from '@apollo/react-hooks';
import useHandleAndroidBack from '../functions/handleAndroidBack';

interface Props extends NavigationStackScreenProps {}

const GET_COMMENT = gql(customGetComment);

const CommentViewScreen = ({ navigation }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const [needProfileUpdateVisible, setNeedProfileUpdateVisible] = useState(false);

  const textInputEl = useRef<TextInput>(null);

  const {
    authStore: { user, profileUpdated, identityId, appearance },
    commentStore: { postId, commentViewAddedToId, postTitle },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);

  const origin = navigation.getParam('origin');

  const _handleDismiss = () => setWarningProps(null);

  const { loading, error, data } = useQuery(GET_COMMENT, {
    variables: { id: commentViewAddedToId },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    ...(!user && { client: guestClient }),
  });

  const _handleBackButton = () => {
    storeDispatch({ type: CANCEL_COMMENT_INPUT });
    if (origin) {
      navigation.navigate(origin);
    } else {
      navigation.goBack();
    }
  };
  useHandleAndroidBack(navigation, _handleBackButton);

  if (error) {
    reportSentry(error);
    return <AccessDenied category={AccessDeniedReason.Error} target={AccessDeniedTarget.Comment} />;
  }

  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
          {origin === 'Noti' && <BackToPostButton needMarginLeft appearance={appearance} />}
        </Left>
        <Body>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>답글 달기</HeaderTitle>
        </Body>
        <Right>
          <CancelInputActionButton needMarginRight keyboardHeight={keyboardHeight} />
          <KeyboardDismissButton setKeyboardHeight={setKeyboardHeight} />
        </Right>
      </SwitchStackHeader>
    );
  };

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={appearance} />
      {renderHeader()}

      {loading || !data || !data.getComment ? (
        <Loading origin={`CommentView_${commentViewAddedToId}`} />
      ) : (
        <>
          <NativeSafeAreaView style={styles.contentContainerView}>
            <View style={[styles.screenMarginHorizontal, styles.containerPaddingTop]}>
              <CommentCard
                commentItem={data.getComment}
                snackbarDispatch={snackbarDispatch}
                setWarningProps={setWarningProps}
                textInputEl={textInputEl}
                postTitle={postTitle}
                // keyboardHeight={keyboardHeight}
              />
            </View>
            <PostCommentsByThread
              addedToId={data.getComment.id}
              snackbarDispatch={snackbarDispatch}
              keyboardHeight={keyboardHeight}
              setWarningProps={setWarningProps}
              textInputEl={textInputEl}
              origin={'CommentView'}
            />
            {!!user && (
              <PostCommentInput
                commentViewReceiverId={data.getComment.author.id}
                snackbarDispatch={snackbarDispatch}
                textInputEl={textInputEl}
                origin={'CommentView'}
                setNeedProfileUpdateVisible={setNeedProfileUpdateVisible}
              />
            )}
          </NativeSafeAreaView>
          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
          {needProfileUpdateVisible && (
            <NeedProfileUpdate
              profileUpdated={profileUpdated}
              setNeedProfileUpdateVisible={setNeedProfileUpdateVisible}
              params={{
                origin: 'CommentView',
                backToPostId: postId,
                userId: user?.username ?? '',
                identityId,
                backToOrigin: origin,
              }}
              appearance={appearance}
            />
          )}
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
        </>
      )}
    </SafeAreaView>
  );
};

export default CommentViewScreen;
