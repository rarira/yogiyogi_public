import { HeaderTitle, NavigationStackScreenProps } from 'react-navigation-stack';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { SafeAreaView as NativeSafeAreaView, TextInput } from 'react-native';
import React, { useReducer, useRef, useState } from 'react';
import WarningDialog, { WarningProps } from '../components/WarningDialog';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import BackButton from '../components/BackButton';
import BackToPostButton from '../components/comm/BackToPostButton';
import Body from '../components/Body';
import { CANCEL_COMMENT_INPUT } from '../stores/actionTypes';
import CancelInputActionButton from '../components/comm/CancelInputActionButton';
import KeyboardDismissButton from '../components/KeyboardDismissButton';
import Left from '../components/Left';
import NeedProfileUpdate from '../components/NeedProfileUpdate';
import { Portal } from 'react-native-paper';
import PostCommentInput from '../components/comm/PostCommentInput';
import PostComments from '../components/comm/PostComments';
import Right from '../components/Right';
import { SafeAreaView } from 'react-navigation';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';
import useHandleAndroidBack from '../functions/handleAndroidBack';

interface Props extends NavigationStackScreenProps {}

const PostCommentViewScreen = ({ navigation }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const [needProfileUpdateVisible, setNeedProfileUpdateVisible] = useState(false);

  const textInputEl = useRef<TextInput>(null);

  const {
    authStore: { user, profileUpdated, identityId, appearance },
    // commentStore: { postId },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);

  const origin = navigation.getParam('origin');
  // console.log(postId);
  // const backToPostId = navigation.getParam('backToPostId');
  const _handleDismiss = () => setWarningProps(null);
  const _handleBackButton = () => {
    storeDispatch({ type: CANCEL_COMMENT_INPUT });

    if (origin) {
      // console.log('deal with origin');
      navigation.navigate(origin);
    } else {
      // console.log('just go back');
      navigation.goBack();
    }
  };

  useHandleAndroidBack(navigation, _handleBackButton);

  // console.log(origin);
  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
          {origin === 'Noti' && <BackToPostButton needMarginLeft appearance={appearance} />}
        </Left>
        <Body>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>게시물 댓글</HeaderTitle>
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
      <NativeSafeAreaView style={styles.contentContainerView}>
        <PostComments
          // addedToId={addedToId}
          snackbarDispatch={snackbarDispatch}
          keyboardHeight={keyboardHeight}
          setWarningProps={setWarningProps}
          textInputEl={textInputEl}
        />
        {!!user && (
          <PostCommentInput
            snackbarDispatch={snackbarDispatch}
            textInputEl={textInputEl}
            origin={'PostCommentView'}
            setNeedProfileUpdateVisible={setNeedProfileUpdateVisible}
          />
        )}
      </NativeSafeAreaView>

      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      {needProfileUpdateVisible && (
        <NeedProfileUpdate
          profileUpdated={profileUpdated}
          setNeedProfileUpdateVisible={setNeedProfileUpdateVisible}
          params={{ origin: 'PostCommentView', userId: user?.username ?? '', identityId, backToOrigin: origin }}
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
    </SafeAreaView>
  );
};

export default PostCommentViewScreen;
