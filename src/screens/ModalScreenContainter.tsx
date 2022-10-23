import { SafeAreaView as NativeSafeAreaView } from 'react-native';
import React, { ReactNode, useEffect, useState } from 'react';

import { SafeAreaView } from 'react-navigation';
import StatusBarNormal from '../components/StatusBarNormal';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

interface Props {
  children1: ReactNode;
  children2?: ReactNode;
}

const ModalScreenContainer = ({ children1, children2 }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getStyles(appearance);

  const [bgColor, setBgColor] = useState('transparent');

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setBgColor(getThemeColor('borderColor', appearance));
    }
    return () => {
      mounted = false;
    };
  }, [appearance]);

  return (
    <SafeAreaView style={[styles.switchScreenContainerView, { backgroundColor: bgColor }]} forceInset={{ top: 'always', bottom: 'never' }}>
      <StatusBarNormal appearance={appearance} switchScreen />
      <NativeSafeAreaView
        style={[
          styles.contentContainerView,
          styles.modalContentContainerView,
          // Platform.OS === 'android' ? { marginTop: StatusBar.currentHeight } : {},
        ]}
      >
        {children1}
      </NativeSafeAreaView>
      {children2}
    </SafeAreaView>
  );
};

export default ModalScreenContainer;
