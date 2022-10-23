import * as Animatable from 'react-native-animatable';

import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { getTheme, normalize } from '../configs/theme';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStoreState } from '../stores/initStore';

interface Props {
  name: string;
  fullName: string;
  color: string;
  fullColor: string;
  focused: boolean;
  dataName: string;
}

const IconWithBadge = ({ name, fullName, color, fullColor, focused, dataName }: Props) => {
  const AnimatedIcon = Animatable.createAnimatableComponent(Icon);
  const largeIconEl = useRef(null);

  const { authStore } = useStoreState();
  const theme = getTheme(authStore.appearance);

  const badgeCount = authStore[dataName]?.count ?? 0;
  const dataUpdated = dataName === 'hearts' ? authStore.heartsUpdated : false;

  const size = dataUpdated ? normalize(50) : focused ? 32 : 25;

  useEffect(() => {
    let _mounted = true;
    if (dataUpdated && _mounted) animateIcon();
    return () => {
      _mounted = false;
    };
  }, [dataUpdated]);

  const animateIcon = () => {
    // largeIconEl!.current!.stopAnimation();
    largeIconEl!.current!.bounceOut().then(() => largeIconEl?.current?.bounceIn());
  };

  return (
    <View style={{ width: size, height: size, margin: 5 }}>
      {dataUpdated ? (
        <AnimatedIcon
          ref={largeIconEl}
          name={fullName}
          color={fullColor}
          size={size}
          // style={styles.animatedIcon}
          duration={500}
          useNativeDriver
          // delay={200}
        />
      ) : (
        <Icon name={name} size={size} color={color} />
      )}

      {!dataUpdated && badgeCount > 0 && (
        <View
          style={{
            // If you're using react-native < 0.57 overflow outside of parent
            // will not work on Android, see https://git.io/fhLJ8
            position: 'absolute',
            right: -size / 6,
            top: -size / 20,
            backgroundColor: dataUpdated ? theme.colors.background : theme.colors.accent,
            borderColor: dataUpdated ? theme.colors.accent : theme.colors.background,
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: size / 4,
            width: size / 2,
            height: size / 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      )}
    </View>
  );
};

// const styles = StyleSheet.create({
//   animatedIcon: {
//     position: 'absolute',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 2,
//     borderRadius: 160,
//     opacity: 0,
//   },
// });

export default memo(IconWithBadge);
