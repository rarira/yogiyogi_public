import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { useReducer, useState } from 'react';
import WarningDialog, { WarningProps } from '../components/WarningDialog';

import Body from '../components/Body';
import CancelButton from '../components/CancelButton';
import ClassCompleteCompButtons from '../components/ClassList/ClassCompleteCompButtons';
import HeaderTitle from '../components/HeaderTitle';
import HeadlineSub from '../components/HeadlineSub';
import Left from '../components/Left';
import ModalScreenContainer from './ModalScreenContainter';
import MyBanner from '../components/MyBanner';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import Right from '../components/Right';
import SearchProxyCandidates from '../components/My/SearchProxyCandidates';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { View } from 'react-native';

import theme, { getThemeColor } from '../configs/theme';
import useHandleAndroidBack from '../functions/handleAndroidBack';
import { getCompStyles } from '../configs/compStyles';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';

interface Props extends NavigationStackScreenProps {}

const ClassCompleteScreen = ({ navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getStyles(appearance);

  const compStyles = getCompStyles(appearance);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);

  const origin = navigation.getParam('origin');
  const classId: string = navigation.getParam('classId');
  const hostId = navigation.getParam('hostId');

  const _handleBackButton = () => {
    navigation.pop();
  };

  const _handleOnDismiss = () => {
    setWarningProps(null);
  };
  useHandleAndroidBack(navigation, _handleBackButton);

  const renderHeader = () => (
    <SwitchStackHeader appearance={appearance} border {...(bannerVisible && { style: compStyles.opacity01 })}>
      <Left>
        <CancelButton onPress={_handleBackButton} disabled={bannerVisible} />
      </Left>
      <Body flex={4}>
        <HeaderTitle tintColor={getThemeColor('text', appearance)}>????????? ?????? ????????? ??????</HeaderTitle>
      </Body>
      <Right />
    </SwitchStackHeader>
  );

  return (
    <ModalScreenContainer
      children1={
        <>
          {renderHeader()}
          <MyBanner
            message="??? ??????(?????? ?????? ????????? ???)??? ?????? ????????? ???????????? ?????? ?????? ????????? ????????? ???????????? ????????? ?????? ?????? ?????? ???????????? ???????????????"
            label1="???????????????"
            visible={bannerVisible}
            setVisible={setBannerVisible}
          />
          <View
            style={[styles.flex1, { ...(bannerVisible && styles.opacity01) }]}
            {...(bannerVisible && { pointerEvents: 'none' })}
          >
            <View style={[styles.containerMarginVertical, styles.screenMarginHorizontal]}>
              <HeadlineSub
                text="????????? ?????? ??????????????? ???????????? ???????????? ???????????? ??????????????? ????????? ???????????????."
                marginBottom={theme.size.small}
              />
            </View>

            <SearchProxyCandidates
              snackbarDispatch={snackbarDispatch}
              classId={classId}
              origin={origin}
              appearance={appearance}
            />
            <ClassCompleteCompButtons
              classId={classId}
              hostId={hostId}
              handleBack={_handleBackButton}
              setWarningProps={setWarningProps}
              snackbarDispatch={snackbarDispatch}
              origin={origin}
              disabled={bannerVisible}
              appearance={appearance}
            />
          </View>
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

export default ClassCompleteScreen;
