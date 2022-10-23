import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { memo, useReducer } from 'react';

import BackButton from '../components/BackButton';
import Body from '../components/Body';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import Right from '../components/Right';
import SearchProxyCandidates from '../components/My/SearchProxyCandidates';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { View } from 'react-native';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

interface Props extends NavigationStackScreenProps {}

const AllChatListScreen = ({ navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const styles = getStyles(appearance);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);

  const origin = navigation.getParam('origin');
  const classId = navigation.getParam('classId');
  const hostId = navigation.getParam('hostId');

  const _handleBackButton = () => {
    navigation.goBack();
  };

  useHandleAndroidBack(navigation, _handleBackButton);

  const renderHeader = () => (
    <SwitchStackHeader appearance={appearance} border>
      <Left>
        <BackButton onPress={_handleBackButton} />
      </Left>
      <Body flex={4}>
        <HeaderTitle tintColor={getThemeColor('text', appearance)}>클래스 담당 선생님 선택</HeaderTitle>
      </Body>
      <Right />
    </SwitchStackHeader>
  );

  return (
    <ModalScreenContainer
      children1={
        <>
          {renderHeader()}
          <View style={[styles.containerMarginVertical, styles.flex1]}>
            <SearchProxyCandidates
              snackbarDispatch={snackbarDispatch}
              hostId={hostId}
              origin={origin}
              classId={classId}
              allChat={true}
              appearance={appearance}
            />
          </View>
        </>
      }
      children2={<MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />}
    />
  );
};

export default memo(AllChatListScreen);
