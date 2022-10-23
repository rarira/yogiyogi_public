import { HeaderTitle, NavigationStackScreenProps } from 'react-navigation-stack';

import Body from '../components/Body';
import CancelButton from '../components/CancelButton';
import KeyboardDismissButton from '../components/KeyboardDismissButton';
import Left from '../components/Left';
import ModalScreenContainer from './ModalScreenContainter';
import React from 'react';
import Right from '../components/Right';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { WebView } from 'react-native-webview';
import useHandleAndroidBack from '../functions/handleAndroidBack';
import { getThemeColor } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

interface Props extends NavigationStackScreenProps {}

const WebViewScreen = ({ navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const title = navigation.getParam('title');
  const url = navigation.getParam('url');
  const runJs = navigation.getParam('runJs');
  const reroute = navigation.getParam('reroute');

  const _handleCancelButton = () => {
    if (reroute) {
      navigation.navigate('MySettings');
    } else {
      navigation.goBack();
    }
  };

  useHandleAndroidBack(navigation, _handleCancelButton);

  const renderHeader = () => (
    <SwitchStackHeader appearance={appearance} border>
      <Left>
        <CancelButton onPress={_handleCancelButton} />
      </Left>
      <Body flex={4}>
        <HeaderTitle tintColor={getThemeColor('text', appearance)}>{title}</HeaderTitle>
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

          <WebView
            // ref={webViewEl}
            source={{ uri: url }}
            allowsBackForwardNavigationGestures={true}
            {...(runJs && { injectedJavaScript: runJs })}
          />
        </>
      }
    />
  );
};

export default WebViewScreen;
