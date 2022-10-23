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
import asyncCreateClassReview from '../functions/asyncCreateClassReview';
import { customPipelineCreateClassProxyReview } from '../customGraphqls';
import gql from 'graphql-tag';
import { getThemeColor, normalize } from '../configs/theme';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useMutation } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';

interface Props extends NavigationStackScreenProps {}

const CREATE_CLASS_REVIEW = gql(customPipelineCreateClassProxyReview);

const ProxyReviewScreen = ({ navigation }: Props) => {
  const [satisfactionState, setSatisfcationState] = useState<SatisfactionType | null>(null);
  const [choosedManners, setChoosedManners] = useState<string[]>([]);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const [content, setContent] = useState<string>('');
  const [createClassReview, { loading }] = useMutation(CREATE_CLASS_REVIEW);
  const {
    authStore: {
      user: { username },
      appearance,
    },
  } = useStoreState();
  const styles = getStyles(appearance);
  const origin = navigation.getParam('origin');
  const classId = navigation.getParam('classId');
  const proxyId = navigation.getParam('proxyId');
  const proxyName = navigation.getParam('proxyName');

  const _handleCancelButton = () => {
    navigation.pop();
  };

  const _handleOnChangeText = (text: string) => {
    setContent(text);
  };

  const _handleOnDismiss = () => {
    setWarningProps(null);
  };

  const _handleComplete = () => {
    const backToOrigin = () => navigation.navigate({ routeName: origin, params: { classId } });

    setWarningProps({
      handleOk: asyncCreateClassReview({
        createClassReview,
        classId,
        reviewerId: username,
        revieweeId: proxyId,
        reviewType: ReviewType.proxyReview,
        satisfactionState: satisfactionState!,
        choosedManners,
        content,
        snackbarDispatch,
        backToOrigin,
      }),
      dismissable: true,
      dialogTitle: '선생님 리뷰 제출',
      dialogContent: '선생님 리뷰를 이대로 제출합니다. 제출한 리뷰는 수정하거나 재작성하실 수 없습니다. 그래도 진행하시겠습니까?',
      okText: '제출합니다',
      dismissText: '아니오',
    });
  };

  useHandleAndroidBack(navigation, _handleCancelButton);

  const renderHeader = () => (
    <SwitchStackHeader appearance={appearance} border>
      <Left>
        <CancelButton onPress={_handleCancelButton} />
      </Left>
      <Body flex={4}>
        <HeaderTitle tintColor={getThemeColor('text', appearance)}>클래스 담당 선생님 리뷰 남기기</HeaderTitle>
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
              revieweeName={proxyName}
              reviewType={ReviewType.proxyReview}
              appearance={appearance}
            />
            <ReviewManners
              satisfactionState={satisfactionState}
              choosedManners={choosedManners}
              setChoosedManners={setChoosedManners}
              revieweeName={proxyName}
              reviewType={ReviewType.proxyReview}
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

export default ProxyReviewScreen;
