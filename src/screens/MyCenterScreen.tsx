import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { memo, useEffect, useMemo, useReducer, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import BackButton from '../components/BackButton';
import Body from '../components/Body';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import ListMyCenters from '../components/ListMyCenters';
import MyBanner from '../components/MyBanner';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import Right from '../components/Right';
import { SafeAreaView } from 'react-native';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import asyncCheckScreenIsFirst from '../functions/asyncCheckScreenIsFirst';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';
import { View } from 'react-native';

// import useHandleAndroidBack from '../functions/handleAndroidBack';

interface Props extends NavigationStackScreenProps {}

const MyCenterScreen = ({ navigation }: Props) => {
  const [bannerVisible, setBannerVisible] = useState(false);

  const { authStore } = useStoreState();
  const styles = getStyles(authStore.appearance);

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const storeDispatch = useStoreDispatch();

  const _handleNavBackButton = () => navigation.goBack();
  // useHandleAndroidBack(navigation, _handleNavBackButton);

  const renderHeader = useMemo(() => {
    return (
      <SwitchStackHeader appearance={authStore.appearance} border>
        <Left>
          <BackButton onPress={_handleNavBackButton} />
        </Left>
        <Body>
          <HeaderTitle tintColor={getThemeColor('text', authStore.appearance)}>마이센터</HeaderTitle>
        </Body>
        <Right />
      </SwitchStackHeader>
    );
  }, [authStore.appearance]);

  useEffect(() => {
    let _mounted = true;

    if (_mounted) {
      const check = asyncCheckScreenIsFirst('MyCenter', authStore.isFirst, storeDispatch);
      if (check) {
        setBannerVisible(true);
      }
    }
    return () => {
      _mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={authStore.appearance} />
      {renderHeader}
      <MyBanner
        message={
          '자주 이용하는 센터/요가원을 미리 등록해 두면 좀더 빠르고 편하게 새로운 클래스를 등록하실 수 있습니다.'
        }
        label1="알겠습니다"
        visible={bannerVisible}
        setVisible={setBannerVisible}
      />
      <View
        style={[styles.flex1, { ...(bannerVisible && styles.opacity01) }]}
        {...(bannerVisible && { pointerEvents: 'none' })}
      >
        <ListMyCenters authStore={authStore} storeDispatch={storeDispatch} snackbarDispatch={snackbarDispatch} />
        <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      </View>
    </SafeAreaView>
  );
};

export default memo(MyCenterScreen);
