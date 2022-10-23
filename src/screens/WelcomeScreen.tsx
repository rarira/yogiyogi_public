import React, { useCallback, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import AsyncStorage from '@react-native-community/async-storage';
import { IsFirstObject } from '../types/store';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import PermissionDialog from '../components/welcome/PermissionDialog';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import { SafeAreaView } from 'react-navigation';
import Video from 'react-native-video';
import { View } from 'react-native';
import WelcomeCarousel from '../components/welcome/WelcomeCarousel';
import { getStyles } from '../configs/styles';
import hideSplashScreen from '../functions/hideSplashScreen';
import produce from 'immer';
import reportSentry from '../functions/reportSentry';

interface Props extends NavigationStackScreenProps {}

const WelcomeScreen = ({ navigation }: Props) => {
  const [permissionRequestVisible, setPermissionRequestVisible] = useState(false);
  const {
    authStore: { isFirst, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);

  const _handleVisible = () => {
    setPermissionRequestVisible(true);
  };

  const _handleOnDismiss = () => {
    (async function() {
      try {
        const nextIsFirst = produce(isFirst, (draft: IsFirstObject) => {
          draft.app = false;
        });
        await AsyncStorage.setItem('guest_isFirst', JSON.stringify(nextIsFirst));
        storeDispatch({ type: SET_AUTHSTORE_STATE, isFirst: nextIsFirst });
      } catch (e) {
        reportSentry(e);
      }
    })();
    setPermissionRequestVisible(false);
    navigation.navigate('Main');
  };

  const yogaMp4 = require('../static/mp4/edited.mp4');
  const onLoad = useCallback(() => hideSplashScreen(), []);
  return (
    <View style={styles.welcomeContainer}>
      <Video
        source={yogaMp4}
        // onError={error => console.log(error)}
        style={styles.backgroundVideo}
        allowsExternalPlayback={false}
        repeat
        rate={0.6}
        muted
        resizeMode="cover"
        onLoad={onLoad}
      />

      <SafeAreaView style={[styles.contentContainerView, styles.welcomeSafeAreaView]}>
        <View style={styles.contentsColumnCenterContainer}>
          <WelcomeCarousel onCancel={_handleVisible} />
        </View>
        <PermissionDialog visible={permissionRequestVisible} onConfirm={_handleOnDismiss} appearance={appearance} />
      </SafeAreaView>
    </View>
  );
};

export default WelcomeScreen;
