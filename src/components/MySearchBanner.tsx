import { Animated, LayoutChangeEvent, View } from 'react-native';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { getCompStyles } from '../configs/compStyles';

import { useStoreState } from '../stores/initStore';
import { getTheme, getThemeColor } from '../configs/theme';

interface Props {
  visible: boolean;
}
const MySearchBanner: FunctionComponent<Props> = ({ visible, children }) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  const [animatedViewPosition] = useState(new Animated.Value(visible ? 1 : 0));
  const [layout, setLayout] = useState<{ height: number; width: number; measured: boolean }>({
    height: 0,
    width: 0,
    measured: false,
  });

  useEffect(() => {
    const _toggle = () => {
      if (visible) {
        _show();
      } else {
        _hide();
      }
    };
    _toggle();
  }, [visible]);

  const _show = () => {
    Animated.timing(animatedViewPosition, {
      duration: 250,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const _hide = () => {
    Animated.timing(animatedViewPosition, {
      duration: 200,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const _handleLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { height, width } = nativeEvent.layout;
    setLayout({ height, width, measured: true });
  };

  const height = Animated.multiply(animatedViewPosition, layout.height);

  const translateY = Animated.multiply(Animated.add(animatedViewPosition, -1), layout.height);

  return (
    <View
      style={[
        {
          overflow: 'hidden',
        },
        compStyles.screenMarginHorizontal,
        compStyles.containerMarginVertical,
      ]}
    >
      <Animated.View style={{ height }} />

      <Animated.View
        onLayout={_handleLayout}
        style={[
          layout.measured || !visible
            ? [{ position: 'absolute', top: 0, width: '100%' }, { transform: [{ translateY }] }]
            : null,
          !layout.measured && !visible ? { opacity: 0 } : null,
          { backgroundColor: getThemeColor('background', appearance) },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export default MySearchBanner;
