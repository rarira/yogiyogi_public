import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ClassReserveButton from './ClassList/ClassReserveButton';
import { ClassStatusType } from '../API';

import { AppearanceType } from '../types/store';
import { getTheme } from '../configs/theme';

interface Props extends NavigationInjectedProps {
  classTitle: string;
  classId: string;
  hostId: string;
  origin: string;
  chatroomDispatch?: any;
  classStatus?: ClassStatusType;
  convId?: string;
  isHost?: boolean;
  type?: string;
  appearance: AppearanceType;
}

const ClassInfoBanner = ({
  navigation,
  classTitle,
  classId,
  classStatus,
  hostId,
  origin,
  convId,
  chatroomDispatch,
  isHost,
  type,
  appearance,
}: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _handleOnPress = () => {
    navigation.push('ClassView', {
      classId,
      hostId,
      origin,
      convId,
    });
  };

  return (
    <View style={styles.container}>
      {type !== 'ClassChatList' && (
        <TouchableOpacity onPress={_handleOnPress} style={styles.title}>
          <Text style={styles.titleText}>클래스 : {classTitle}</Text>
        </TouchableOpacity>
      )}

      {classStatus && (
        <ClassReserveButton
          classId={classId}
          classStatus={classStatus}
          chatroomDispatch={chatroomDispatch}
          isHost={isHost}
          appearance={appearance}
        />
      )}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.blue50,
      paddingHorizontal: theme.size.big,
      paddingVertical: theme.size.small,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      marginBottom: theme.size.xs,
    },
    titleText: { color: theme.colors.text },
  });

export default memo(withNavigation(ClassInfoBanner));
