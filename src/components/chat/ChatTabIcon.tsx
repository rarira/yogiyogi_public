import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getTheme } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props {
  focused: boolean;
  tintColor: string;
}

const ChatTabIcon = ({ focused, tintColor }: Props) => {
  const {
    authStore: { newChats, appearance },
  } = useStoreState();
  const theme = getTheme(appearance);

  const size = focused ? 30 : 23;
  const badgeSize = focused ? 32 : 25;

  return (
    <View style={{ width: size, height: size, margin: 5 }}>
      <MaterialCommunityIcons name="message-text-outline" color={tintColor} size={size} />
      {newChats.length > 0 && (
        <View
          style={{
            // If you're using react-native < 0.57 overflow outside of parent
            // will not work on Android, see https://git.io/fhLJ8
            position: 'absolute',
            right: -badgeSize / 6,
            top: -badgeSize / 20,
            backgroundColor: theme.colors.accent,
            borderColor: theme.colors.background,
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: badgeSize / 4,
            width: badgeSize / 2,
            height: badgeSize / 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      )}
    </View>
  );
};

export default memo(ChatTabIcon);
