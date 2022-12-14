import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import { BackHandler, Keyboard, TouchableOpacity } from 'react-native';
import MySnackbar, { OPEN_SNACKBAR, snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { FunctionComponent, Reducer, memo, useCallback, useEffect, useReducer, useState } from 'react';
import { customGetUserProfile, updateUserProfile } from '../customGraphqls';
import { useMutation, useQuery } from '@apollo/react-hooks';

import AndroidDivider from '../components/AndroidDivider';
import Body from '../components/Body';
import CancelButton from '../components/CancelButton';
import CancelDialog from '../components/CancelDialog';
import HeaderTitle from '../components/HeaderTitle';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import KeyboardDismissButton from '../components/KeyboardDismissButton';
import KoreanParagraph from '../components/KoreanParagraph';
import Left from '../components/Left';
import Loading from '../components/Loading';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import { ProfileState } from '../types/store';
import { QueryResult } from '@apollo/react-common';
import Right from '../components/Right';
import { SET_PROFILE_UPDATED } from '../stores/actionTypes';
import SaveButton from '../components/SaveButton';
import SingleLineInputField from '../components/SingleLineInputField';
import SwitchStackHeader from '../components/SwitchStackHeader';
import UpdateProfilePictureButton from '../components/My/UpdateProfilePictureButton';
import { UpdateUserInput } from '../API';
import UserThumbnail from '../components/UserThumbnail';
import awsmobile from '../aws-exports';
import gql from 'graphql-tag';
import isURL from 'validator/lib/isURL';
import { getTheme, normalize } from '../configs/theme';
import openProfilePickerActionSheet from '../functions/openProfilePickerActionSheet';
import removeFromS3 from '../functions/removeFromS3';
import reportSentry from '../functions/reportSentry';

import throttle from 'lodash/throttle';
import uploadToS3 from '../functions/uploadToS3';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useStoreDispatch, useStoreState } from '../stores/initStore';
import uuidv4 from 'uuid/v4';
import { getStyles } from '../configs/styles';

interface Props extends NavigationStackScreenProps {}

const GET_USER_PROFILE = gql(customGetUserProfile);
const UPDATE_USER = gql(updateUserProfile);

const { aws_user_files_s3_bucket_region: region, aws_user_files_s3_bucket: bucket } = awsmobile;

const initialState: ProfileState = {
  profilePicture: null,
  nameError: '',
  urlError: '',
  cellPhoneError: '',
  name: '',
  intro: '',
  resumeURL: '',
  facebookId: '',
  instagramId: '',
  cellPhoneNumber: '',
  pictureUpdated: false,
  updated: false,
};

const cellPhoneCheck = (input: string) => input.match(/^\d{3}-\d{3,4}-\d{4}$/) !== null;

const reducer: Reducer<ProfileState, any> = (state, action) => {
  const { type, resumeURL, cellPhoneNumber, ...others } = action;

  switch (type) {
    case 'updateState': {
      return {
        ...state,
        ...others,
        ...(resumeURL !== undefined && { resumeURL, urlError: resumeURL !== '' && !isURL(resumeURL) ? '????????? URL ????????? ????????????' : '' }),
        ...(cellPhoneNumber !== undefined && {
          cellPhoneNumber,
          cellPhoneError: cellPhoneNumber !== '' && !cellPhoneCheck(cellPhoneNumber) ? '000-0000-0000??? ????????? ???????????????' : '',
        }),
      };
    }
    case 'reset': {
      return {
        ...initialState,
      };
    }
  }
};

const UpdateProfileScreen: FunctionComponent<any> = ({ navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const { error, data }: QueryResult = useQuery(GET_USER_PROFILE, {
    variables: { id: navigation.getParam('userId') },
  });

  const [updateUser, { loading: updateUserLoading }] = useMutation(UPDATE_USER);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [profileState, dispatch] = useReducer(reducer, initialState);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const { showActionSheetWithOptions } = useActionSheet();

  const {
    profilePicture,
    name,
    intro,
    resumeURL,
    instagramId,
    facebookId,
    cellPhoneNumber,
    pictureUpdated,
    updated,
    nameError,
    urlError,
    cellPhoneError,
  } = profileState;

  // console.log(profilePicture, typeof profilePicture);
  const storeDispatch = useStoreDispatch();

  const origin = navigation.getParam('origin');
  const classId = navigation.getParam('classId');
  const backToPostId = navigation.getParam('backToPostId');
  const hostId = navigation.getParam('hostId');
  const userId = navigation.getParam('userId');
  const identityId = navigation.getParam('identityId');
  const backToOrigin = navigation.getParam('backToOrigin');

  useEffect(() => {
    const getProfile = () => {
      const { name, intro, picture, oauthPicture, resumeURL, instagramId, facebookId, cellPhoneNumber } = data.getUser;

      dispatch({
        type: 'updateState',
        name: name || '',
        profilePicture: picture || oauthPicture || null,
        intro: intro || '',
        resumeURL: resumeURL || '',
        instagramId: instagramId || '',
        facebookId: facebookId || '',
        cellPhoneNumber: cellPhoneNumber || '',
      });
    };

    if (data && data.getUser) {
      getProfile();
    }
  }, [data]);

  const _handleNavBack = () => {
    if (origin) {
      navigation.navigate(origin, { classId, hostId, backToPostId, origin: backToOrigin ?? 'UpdateProfile' });
    } else {
      navigation.pop();
    }
  };

  const _handleBackButton = useCallback(() => {
    if (updated) {
      setCancelVisible(true);
    } else {
      _handleNavBack();
    }
  }, [updated]);

  useEffect(() => {
    const backHandlerSubs = BackHandler.addEventListener('hardwareBackPress', () => {
      if (updated) {
        setCancelVisible(true);
        return true;
      } else {
        _handleNavBack();
        return true;
      }
    });
    return () => {
      backHandlerSubs.remove();
    };
  }, [updated]);

  const _handleOnNameChange = (input: string) => dispatch({ type: 'updateState', name: input, updated: true, nameError: '' });

  const _handleOnInputChange = (type: string) => (input: string) => dispatch({ type: 'updateState', [type]: input, updated: true });

  const _handleOnSave = throttle(async () => {
    if (!name) {
      dispatch({ type: 'updateState', nameError: '???????????? ????????? ?????????' });
    } else if (!!urlError || !!cellPhoneError) {
      Keyboard.dismiss();

      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: '?????? ????????? ???????????????',
        duration: 1000,
        snackbarType: 'error',
        // sideEffect: _handleNavBack,
      });
    } else if (!profilePicture) {
      Keyboard.dismiss();

      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: '????????? ????????? ???????????????',
        duration: 500,
      });
    } else {
      try {
        Keyboard.dismiss();
        let updateUserProfileInput: UpdateUserInput = {
          id: userId!,
          ...(intro && { intro }),
          ...(name && { name }),
          ...(resumeURL && { resumeURL }),
          ...(instagramId && { instagramId }),
          ...(cellPhoneNumber && { cellPhoneNumber }),
          ...(facebookId && { facebookId }),
          ...(identityId !== data.getUser.identityId && { identityId }),
          profileUpdated: true,
        };

        if (pictureUpdated && typeof profilePicture === 'string') {
          const key = `${userId}_profilePicture_${uuidv4()}.jpg`;
          await uploadToS3(profilePicture, key, 'protected', 'image/jpeg');
          //remove old picture from S3 if existed
          if (data?.getUser.picture !== null) {
            await removeFromS3(data?.getUser.picture.key, 'protected');
          }

          const fileForUpload = {
            bucket,
            key,
            region,
          };
          updateUserProfileInput.picture = fileForUpload;
        }
        await updateUser({
          variables: { input: updateUserProfileInput },
          optimisticResponse: {
            __typename: 'Mutation',
            updateUser: {
              __typename: 'User',
              id: userId,
              name,
              intro,
              ...(pictureUpdated
                ? {
                    picture: {
                      __typename: 'S3Object',
                      ...updateUserProfileInput.picture,
                    },
                  }
                : typeof profilePicture === 'object'
                ? {
                    picture: {
                      __typename: 'S3Object',
                      ...profilePicture,
                    },
                  }
                : {}),
              resumeURL,
              facebookId,
              instagramId,
              cellPhoneNumber,
            },
          },
        });

        await storeDispatch({ type: SET_PROFILE_UPDATED, profileName: name });

        snackbarDispatch({
          type: OPEN_SNACKBAR,
          message: '????????? ???????????? ??????',
          duration: 1000,
          sideEffect: _handleNavBack,
        });
      } catch (e) {
        reportSentry(e);
        // console.log(JSON.parse(JSON.stringify(e)));
        // ?????? snackbar ??????
        snackbarDispatch({
          type: OPEN_SNACKBAR,
          message: e.message,
        });
      }
    }
  }, 5000);

  const styles = getStyles(appearance);
  const theme = getTheme(appearance);

  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <CancelButton onPress={_handleBackButton} disabled={cancelVisible} />
        </Left>
        <Body flex={4}>
          <HeaderTitle tintColor={theme.colors.text}>????????? ????????????</HeaderTitle>
        </Body>
        <Right>
          <KeyboardDismissButton needMarginRight />

          <SaveButton disabled={!updated || cancelVisible} loading={updateUserLoading} onPress={_handleOnSave} appearance={appearance} />
        </Right>
      </SwitchStackHeader>
    );
  };
  // , [updated, cancelVisible, updateUserLoading]);

  if (!data || !data.getUser) return <Loading origin="UpdateProfileScreen" />;
  if (error) {
    reportSentry(error);
    return <AccessDenied category={AccessDeniedReason.Error} target={AccessDeniedTarget.Error} />;
  }

  const _handlePictureOnPress = openProfilePickerActionSheet({
    width: 120,
    height: 120,
    // maxFiles: MAX_FILES_PER_POST - pics.length,
    showActionSheetWithOptions,
    dispatch,
    appearance,
  });

  return (
    <ModalScreenContainer
      children1={
        <>
          {renderHeader()}

          <KeyboardAwareScrollView
            contentContainerStyle={[styles.containerMarginVertical, styles.screenMarginHorizontal]}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
            // extraHeight={20}
            extraScrollHeight={normalize(50)}
            enableOnAndroid={true}
          >
            <TouchableOpacity onPress={_handlePictureOnPress} style={styles.columnCenterContainer}>
              <UserThumbnail isMyself source={profilePicture} size={theme.iconSize.thumbnail} noBackground noBadge />
              <UpdateProfilePictureButton noPicture={!profilePicture} appearance={appearance} />
            </TouchableOpacity>
            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            <SingleLineInputField
              withFormik={false}
              required
              labelText="?????????(??????)"
              placeholder="????????? ????????? ???????????????(??????)"
              value={name}
              onChangeText={_handleOnNameChange}
              autoCorrect={false}
              autoCapitalize="none"
              maxLength={8}
              stateError={nameError}
              clearButtonMode="while-editing"
            />
            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            {/* <HeadlineSub text="????????????" marginBottom={theme.size.small} fontSize={theme.fontSize.small} /> */}
            <SingleLineInputField
              withFormik={false}
              // mode="outlined"
              multiline
              labelText="?????? ??????"
              placeholder="100??? ????????? ????????? ????????? ????????? ???????????????(??????)"
              value={intro}
              onChangeText={_handleOnInputChange('intro')}
              autoCorrect={false}
              autoCapitalize="none"
              style={{ height: 120, textAlignVertical: 'top' }}
              maxLength={100}
              clearButtonMode="while-editing"
            />

            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            {/* <KoreanParagraph text="?????? ???????????? ?????? ????????? ????????? ?????? ???????????? ???????????????. ?????? ???????????? ???????????????" /> */}
            <SingleLineInputField
              withFormik={false}
              labelText="????????? ??????"
              placeholder="?????? ????????? URL??? ???????????????(??????)"
              value={resumeURL}
              onChangeText={_handleOnInputChange('resumeURL')}
              autoCorrect={false}
              autoCapitalize="none"
              stateError={urlError}
              errorCheck
              clearButtonMode="while-editing"
            />
            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            <SingleLineInputField
              withFormik={false}
              labelText="??????????????? ID"
              placeholder="??????????????? ID??? ???????????????(??????)"
              value={instagramId}
              onChangeText={_handleOnInputChange('instagramId')}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            <SingleLineInputField
              withFormik={false}
              labelText="???????????? ID"
              placeholder="???????????? ID??? ???????????????(??????)"
              value={facebookId}
              onChangeText={_handleOnInputChange('facebookId')}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            <SingleLineInputField
              withFormik={false}
              labelText="????????? ??????"
              placeholder="????????? ????????? ???????????????(??????)"
              value={cellPhoneNumber}
              onChangeText={_handleOnInputChange('cellPhoneNumber')}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              errorCheck
              stateError={cellPhoneError}
              maxLength={13}
            />

            <KoreanParagraph
              text="????????? ????????? ??? ??????????????? ???????????? ?????? ????????? ?????? ?????? ?????? ??????????????? ???????????????. ????????? ??????????????? ????????? ????????? ?????????"
              textStyle={styles.accentListItemTitle}
              paragraphStyle={styles.paddingBottomVertical}
            />
          </KeyboardAwareScrollView>
        </>
      }
      children2={
        <>
          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />

          <CancelDialog
            cancelVisible={cancelVisible}
            setCancelVisible={setCancelVisible}
            title="????????? ???????????? ??????"
            description="?????? ????????? ?????? ????????? ????????? ?????? ??????????????? ????????? ??????????????? ??????????????? ????????????."
            onCancel={_handleNavBack}
            appearance={appearance}
          />
        </>
      }
    />
  );
};

export default memo(UpdateProfileScreen);
