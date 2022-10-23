import { ADD_POST_STATE_RESET, CREATE_POST_FINISHED, SET_ADD_POST_STATE, UPDATE_POST_FINISHED } from '../stores/actionTypes';
import MySnackbar, { OPEN_SNACKBAR, snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { useReducer, useRef } from 'react';
import { customCreatePost, customUpdatePost } from '../customGraphqls';
import { getTheme, getThemeColor, normalize } from '../configs/theme';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import AddPostBottomSheet from '../components/addPost/AddPostBottomSheet';
import AndroidDivider from '../components/AndroidDivider';
import Body from '../components/Body';
import CancelButton from '../components/CancelButton';
import CancelDialog from '../components/CancelDialog';
import ContentPost from '../components/addPost/ContentPost';
import HeaderTitle from '../components/HeaderTitle';
import ItemAfterCreateDialog from '../functions/ItemAfterCreateDialog';
import { Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import KeyboardDismissButton from '../components/KeyboardDismissButton';
import Left from '../components/Left';
import LinkPost from '../components/addPost/LinkPost';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NeedProfileUpdate from '../components/NeedProfileUpdate';
import PicturePost from '../components/addPost/PicturePost';
import PostCategoryMenu from '../components/addPost/PostCategoryMenu';
import RBSheet from 'react-native-raw-bottom-sheet';
import Right from '../components/Right';
import SaveButton from '../components/SaveButton';
import SwitchStackHeader from '../components/SwitchStackHeader';
import TagPost from '../components/addPost/TagPost';
import TitlePost from '../components/addPost/TitlePost';
import createPost from '../functions/createPost';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

import throttle from 'lodash/throttle';
import updatePost from '../functions/updatePost';
import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useMutation } from '@apollo/react-hooks';
import uuidv4 from 'uuid/v4';
import { getStyles } from '../configs/styles';

interface Props extends NavigationStackScreenProps {}

const CREATE_POST = gql(customCreatePost);
const UPDATE_POST = gql(customUpdatePost);

const AddPostScreen = ({ navigation }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const bottomSheetEl = useRef<RBSheet>(null);

  const {
    authStore: { user, profileUpdated, identityId, appearance },
    postStore,
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);
  const theme = getTheme(appearance);

  const { cancelVisible, dialogVisible, updateMode, postTitle, postContent, postCategory, postId, postTags } = postStore;
  const origin = navigation.getParam('origin');

  const [createPosts, { loading: createLoading }] = useMutation(CREATE_POST);
  const [updatePosts, { loading: updateLoading }] = useMutation(UPDATE_POST);

  const _handleCancelButton = () => {
    if (origin === 'Comm' && updateMode) {
      storeDispatch({ type: ADD_POST_STATE_RESET });
      navigation.navigate('PostView');
    } else if (origin) {
      storeDispatch({ type: ADD_POST_STATE_RESET });
      navigation.navigate(origin);
    } else {
      storeDispatch({ type: ADD_POST_STATE_RESET });
      navigation.navigate(`${updateMode ? 'PostView' : 'Home'}`);
    }
  };
  const _handleSetCancelVisible = (bool: boolean) => storeDispatch({ type: SET_ADD_POST_STATE, cancelVisible: bool });

  const _androidCallBack = () => _handleSetCancelVisible(true);

  useHandleAndroidBack(navigation, _androidCallBack);

  const _handleOnDismiss = () => storeDispatch({ type: SET_ADD_POST_STATE, dialogVisible: false });

  const _handleNavigateToPostView = () => {
    _handleOnDismiss();
    navigation.navigate('PostView', { origin, postId, updated: updateMode ? 'updated' : 'added' });
  };

  const renderHeader = () => {
    const _handleOnSave = throttle(async () => {
      Keyboard.dismiss();
      try {
        if (!updateMode) {
          const id = uuidv4();

          await createPost({ username: user.username, postStore, mutationFn: createPosts, id });
          storeDispatch({ type: CREATE_POST_FINISHED, postId: id });
        } else {
          await updatePost({ postStore, mutationFn: updatePosts });
          storeDispatch({ type: UPDATE_POST_FINISHED, postId });
        }
      } catch (e) {
        snackbarDispatch({ type: OPEN_SNACKBAR, message: e.message });
        reportSentry(e);
      }
    }, 5000);

    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <CancelButton onPress={_androidCallBack} />
        </Left>
        <Body flex={4}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>게시물 {updateMode ? '수정' : '작성'}</HeaderTitle>
        </Body>
        <Right>
          <KeyboardDismissButton needMarginRight />
          <SaveButton
            disabled={cancelVisible || !postTitle || !postCategory || !postContent || createLoading || updateLoading}
            loading={createLoading || updateLoading}
            onPress={_handleOnSave}
            appearance={appearance}
          />

          {/* <ShowDisclaimerButton iconName="help" onPress={_handleHelpButton} color={theme.colors.focus}             appearance={appearance} /> */}
        </Right>
      </SwitchStackHeader>
    );
  };

  return (
    <ModalScreenContainer
      children1={
        <>
          {renderHeader()}
          <KeyboardAwareScrollView
            contentContainerStyle={[
              // styles.contentContainerView,
              styles.containerMarginVertical,
              styles.screenMarginHorizontal,
              // { flexGrow: 1 },
            ]}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
            extraScrollHeight={normalize(20)}
            enableOnAndroid={true}
            alwaysBounceVertical={false}
          >
            <PostCategoryMenu />
            <AndroidDivider color={theme.colors.disabled} />

            <TitlePost />
            <AndroidDivider color={theme.colors.disabled} />

            <PicturePost appearance={appearance} />
            <AndroidDivider color={theme.colors.disabled} />

            <LinkPost appearance={appearance} />
            <AndroidDivider color={theme.colors.disabled} />

            {postCategory === 'info' && (
              <>
                <TagPost bottomSheetEl={bottomSheetEl} />
                <AndroidDivider color={theme.colors.disabled} />
              </>
            )}

            <ContentPost appearance={appearance} />
          </KeyboardAwareScrollView>
        </>
      }
      children2={
        <>
          {!!user && (
            <NeedProfileUpdate
              profileUpdated={profileUpdated}
              // setNeedProfileUpdateVisible={setNeedProfileUpdateVisible}
              params={{ userId: user.username, identityId }}
              appearance={appearance}
            />
          )}
          <AddPostBottomSheet postTags={postTags} bottomSheetEl={bottomSheetEl} />

          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
          <CancelDialog
            cancelVisible={cancelVisible}
            setCancelVisible={_handleSetCancelVisible}
            title={`게시물 작성 중단`}
            onCancel={_handleCancelButton}
            appearance={appearance}
          />
          <ItemAfterCreateDialog
            itemName={'게시물'}
            suffix={'을'}
            dialogVisible={dialogVisible}
            updateMode={updateMode}
            handleCancelButton={_handleCancelButton}
            handleOnDismiss={_handleOnDismiss}
            handleNavigation={_handleNavigateToPostView}
            appearance={appearance}
          />
        </>
      }
    />
  );
};

export default AddPostScreen;
