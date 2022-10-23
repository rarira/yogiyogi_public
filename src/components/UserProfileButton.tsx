import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

import { TouchableOpacity } from 'react-native-gesture-handler';
import getUserId from '../functions/getUserId';
import handleNavToUserProfile from '../functions/handleNavToUserProfile';
import isEqual from 'react-fast-compare';
import theme from '../configs/theme';

// import { useStoreState } from '../stores/initStore';

interface Props extends NavigationInjectedProps {
  disabled: boolean;
  targetId: string;
  targetIdentityId?: string | null;
  origin: string;
  targetName?: string | null;
  textStyle?: TextStyle;
  ThumbnailComponent?: any;
}

const UserProfileButton = ({
  disabled,
  targetId,
  targetIdentityId,
  targetName,
  origin,
  navigation,
  textStyle,
  ThumbnailComponent,
}: Props) => {
  // const {
  //   authStore: { appearance },
  // } = useStoreState();
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={handleNavToUserProfile(navigation, origin, targetId, targetIdentityId, targetName)}
      style={styles.container}
    >
      {!!ThumbnailComponent && <ThumbnailComponent />}
      <Text
        style={[
          styles.cardInfoText,
          textStyle,
          {
            marginLeft: !!ThumbnailComponent ? theme.size.small : undefined,
            // color: getThemeColor('backdrop', appearance),
          },
        ]}
      >
        {targetName || '닉네임 없음'}({getUserId(targetId)})
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cardInfoText: {
    fontSize: theme.fontSize.small,
  },
});

export default memo(withNavigation(UserProfileButton), isEqual);
