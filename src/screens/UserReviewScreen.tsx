import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { useReducer, useState } from 'react';
import { ReviewType, SatisfactionType } from '../API';
import WarningDialog, { WarningProps } from '../components/WarningDialog';

import Body from '../components/Body';
import CancelButton from '../components/CancelButton';
import HeaderTitle from '../components/HeaderTitle';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import KeyboardDismissButton from '../components/KeyboardDismissButton';
import Left from '../components/Left';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import ReviewManners from '../components/My/ReviewManners';
import ReviewSatisfaction from '../components/My/ReviewSatisfaction';
import Right from '../components/Right';
import SwitchStackHeader from '../components/SwitchStackHeader';
import asyncCreateUserReview from '../functions/asyncCreateUserReview';
import { customCreateUserReview } from '../customGraphqls';
import gql from 'graphql-tag';
import { getThemeColor, normalize } from '../configs/theme';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useMutation } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';

interface Props extends NavigationStackScreenProps {}

const CREATE_USER_REVIEW = gql(customCreateUserReview);

const UserReviewScreen = ({ navigation }: Props) => {
  const [satisfactionState, setSatisfcationState] = useState<SatisfactionType | null>(null);
  const [choosedManners, setChoosedManners] = useState<string[]>([]);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const [content, setContent] = useState<string>('');
  const [createUserReview, { loading }] = useMutation(CREATE_USER_REVIEW);
  const {
    authStore: {
      user: { username },
      appearance,
    },
  } = useStoreState();
  const styles = getStyles(appearance);
  const userId = navigation.getParam('userId');
  const userName = navigation.getParam('userName');

  const _handleCancelButton = () => navigation.pop();

  const _handleOnChangeText = (text: string) => {
    setContent(text);
  };

  const _handleOnDismiss = () => {
    setWarningProps(null);
  };

  const _handleComplete = () => {
    const args = {
      createUserReview,
      reviewerId: username,
      revieweeId: userId,
      reviewType: ReviewType.mannerReview,
      satisfactionState: satisfactionState!,
      choosedManners,
      content,
      snackbarDispatch,
      backToOrigin: _handleCancelButton,
    };

    setWarningProps({
      handleOk: asyncCreateUserReview(args),
      dismissable: true,
      dialogTitle: '????????? ?????? ??????',
      dialogContent: '????????? ????????? ????????? ???????????????. ????????? ????????? ??????????????? ??????????????? ??? ????????????. ????????? ?????????????????????????',
      okText: '???????????????',
      dismissText: '?????????',
    });
  };

  useHandleAndroidBack(navigation, _handleCancelButton);

  const renderHeader = () => (
    <SwitchStackHeader appearance={appearance} border>
      <Left>
        <CancelButton onPress={_handleCancelButton} />
      </Left>
      <Body flex={4}>
        <HeaderTitle tintColor={getThemeColor('text', appearance)}>????????? ?????? ?????????</HeaderTitle>
      </Body>
      <Right>
        <KeyboardDismissButton />
      </Right>
    </SwitchStackHeader>
  );

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
            extraScrollHeight={normalize(50)}
            enableOnAndroid={true}
          >
            <ReviewSatisfaction
              satisfactionState={satisfactionState}
              setSatisfactionState={setSatisfcationState}
              revieweeName={userName}
              reviewType={ReviewType.mannerReview}
              appearance={appearance}
            />
            <ReviewManners
              satisfactionState={satisfactionState}
              choosedManners={choosedManners}
              setChoosedManners={setChoosedManners}
              revieweeName={userName}
              reviewType={ReviewType.mannerReview}
              handleOnChangeText={_handleOnChangeText}
              handleComplete={_handleComplete}
              content={content}
              loading={loading}
              appearance={appearance}
            />
          </KeyboardAwareScrollView>
        </>
      }
      children2={
        <>
          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
          {warningProps && (
            <WarningDialog
              {...warningProps}
              handleDismiss={_handleOnDismiss}
              visible
              snackbarDispatch={snackbarDispatch}
              navigation={navigation}
              appearance={appearance}
            />
          )}
        </>
      }
    />
  );
};

export default UserReviewScreen;
