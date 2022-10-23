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
        ...(resumeURL !== undefined && { resumeURL, urlError: resumeURL !== '' && !isURL(resumeURL) ? '올바른 URL 형식이 아닙니다' : '' }),
        ...(cellPhoneNumber !== undefined && {
          cellPhoneNumber,
          cellPhoneError: cellPhoneNumber !== '' && !cellPhoneCheck(cellPhoneNumber) ? '000-0000-0000의 형태로 입력하세요' : '',
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
      dispatch({ type: 'updateState', nameError: '닉네임을 입력해 주세요' });
    } else if (!!urlError || !!cellPhoneError) {
      Keyboard.dismiss();

      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: '입력 오류를 확인하세요',
        duration: 1000,
        snackbarType: 'error',
        // sideEffect: _handleNavBack,
      });
    } else if (!profilePicture) {
      Keyboard.dismiss();

      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: '프로필 사진은 필수입니다',
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
          message: '프로필 업데이트 성공',
          duration: 1000,
          sideEffect: _handleNavBack,
        });
      } catch (e) {
        reportSentry(e);
        // console.log(JSON.parse(JSON.stringify(e)));
        // 에러 snackbar 출력
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
          <HeaderTitle tintColor={theme.colors.text}>프로필 업데이트</HeaderTitle>
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
              labelText="닉네임(필수)"
              placeholder="친근한 이름을 입력하세요(필수)"
              value={name}
              onChangeText={_handleOnNameChange}
              autoCorrect={false}
              autoCapitalize="none"
              maxLength={8}
              stateError={nameError}
              clearButtonMode="while-editing"
            />
            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            {/* <HeadlineSub text="자기소개" marginBottom={theme.size.small} fontSize={theme.fontSize.small} /> */}
            <SingleLineInputField
              withFormik={false}
              // mode="outlined"
              multiline
              labelText="자기 소개"
              placeholder="100자 이내로 자신을 소개할 문구를 입력하세요(선택)"
              value={intro}
              onChangeText={_handleOnInputChange('intro')}
              autoCorrect={false}
              autoCapitalize="none"
              style={{ height: 120, textAlignVertical: 'top' }}
              maxLength={100}
              clearButtonMode="while-editing"
            />

            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            {/* <KoreanParagraph text="아래 항목들은 좀더 자세한 소개를 위한 부가적인 정보입니다. 모든 유저에게 공개됩니다" /> */}
            <SingleLineInputField
              withFormik={false}
              labelText="이력서 링크"
              placeholder="외부 이력서 URL을 입력하세요(선택)"
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
              labelText="인스타그램 ID"
              placeholder="인스타그램 ID를 입력하세요(선택)"
              value={instagramId}
              onChangeText={_handleOnInputChange('instagramId')}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            <SingleLineInputField
              withFormik={false}
              labelText="페이스북 ID"
              placeholder="페이스북 ID를 입력하세요(선택)"
              value={facebookId}
              onChangeText={_handleOnInputChange('facebookId')}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            <AndroidDivider color={theme.colors.placeholder} needMarginVertical />

            <SingleLineInputField
              withFormik={false}
              labelText="휴대폰 번호"
              placeholder="휴대폰 번호를 입력하세요(선택)"
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
              text="휴대폰 번호는 타 사용자에게 공개되지 않고 이벤트 경품 발송 등의 목적으로만 사용됩니다. 이벤트 응모시에는 반드시 입력해 주세요"
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
            title="프로필 업데이트 중단"
            description="우측 상단의 전송 버튼을 누르지 않고 중단하시면 프로필 업데이트는 이루어지지 않습니다."
            onCancel={_handleNavBack}
            appearance={appearance}
          />
        </>
      }
    />
  );
};

export default memo(UpdateProfileScreen);
