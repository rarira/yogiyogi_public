import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ClassStatusType } from '../../API';
import { NavigationInjectedProps } from 'react-navigation';
import getClassStatus from '../../functions/getClassStatus';

import { useStoreState } from '../../stores/initStore';
import { withNavigation } from 'react-navigation';
import ThemedButton from '../ThemedButton';
import { getTheme } from '../../configs/theme';

interface Props extends NavigationInjectedProps {
  hostId: string;
  hostName: string;
  classId: string;
  classStatus: ClassStatusType;
  setNeedAuthVisible: (arg: boolean) => void;
  setNeedProfileUpdateVisible: (arg: boolean) => void;
  handleShare: () => void;
  numOfConvs: string | number;
  classTitle: string;
}

const ClassViewButtons = ({
  navigation,
  hostId,
  hostName,
  classId,
  classStatus,
  setNeedAuthVisible,
  setNeedProfileUpdateVisible,
  handleShare,
  numOfConvs,
}: Props) => {
  const {
    authStore: { user, profileUpdated, appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const isHost = user && hostId === user.username;
  const origin = navigation.getParam('origin');

  // * 개발용
  // classStatus = ClassStatusType.completed;

  const _handleNavBackButton = () => {
    navigation.navigate(origin || 'Search');
  };

  const _handleNavToClassChatList = () => {
    navigation.navigate('ClassChatList', { classId, origin });
  };

  const _handleOpenChat = () => {
    if (!user) {
      setNeedAuthVisible(true);
      return;
    } else if (!profileUpdated) {
      setNeedProfileUpdateVisible(true);
      return;
    } else {
      const userId = user.username;
      navigation.navigate('ChatView', {
        convId: `${classId}_${userId}`,
        classId,
        origin: 'ClassView',
        type: 'ClassView',
        partner: {
          id: hostId,
          name: hostName,
        },
        hostId,
      });
    }
  };

  const renderNavBackButton = (buttonText: string) => (
    <ThemedButton
      mode="outlined"
      color={theme.colors.backdrop}
      onPress={_handleNavBackButton}
      style={styles.buttonStyle}
    >
      <Text style={styles.fontSizeNormal}>{buttonText}</Text>
    </ThemedButton>
  );

  const classStatusText = useMemo(() => getClassStatus(classStatus, appearance).text, [classStatus]);

  return (
    <View style={styles.container}>
      {classStatus !== ClassStatusType.open && classStatus !== ClassStatusType.reserved ? (
        renderNavBackButton(classStatusText)
      ) : isHost && numOfConvs === 0 ? (
        <ThemedButton mode="outlined" onPress={handleShare} style={styles.buttonStyle}>
          <Text style={styles.fontSizeNormal}>여기저기 알리기</Text>
        </ThemedButton>
      ) : isHost ? (
        <ThemedButton
          mode="contained"
          onPress={_handleNavToClassChatList}
          color={theme.colors.primary}
          style={[styles.buttonStyle]}
        >
          <Text style={styles.fontSizeNormal}>{`클래스 채팅 리스트(${numOfConvs})`}</Text>
        </ThemedButton>
      ) : (
        <ThemedButton
          mode="contained"
          onPress={_handleOpenChat}
          color={theme.colors.primary}
          style={[styles.buttonStyle]}
        >
          <Text style={styles.fontSizeNormal}>호스트와 채팅</Text>
        </ThemedButton>
      )}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.borderColor,
      paddingHorizontal: theme.size.big,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
    },
    buttonStyle: {
      flex: 1,
      justifyContent: 'flex-end',
      marginTop: theme.size.normal,
      marginBottom: theme.size.normal,
    },
    marginRight: { marginRight: theme.size.normal },
    fontSizeNormal: { fontSize: theme.fontSize.normal, color: theme.colors.text },
    // fontSizeSmall: { fontSize: theme.fontSize.small },
  });

export default memo(withNavigation(ClassViewButtons));
