import { StyleSheet, Text, View } from 'react-native';

import KoreanParagraph from '../KoreanParagraph';
import React from 'react';
import { openSettings } from 'react-native-permissions';
import theme, { getThemeColor } from '../../configs/theme';
import ThemedButton from '../ThemedButton';
import { AppearanceType } from '../../types/store';
import { useStoreState } from '../../stores/initStore';

interface Props {
  isMySubsScreen?: boolean;
}

const NotiPermissionDenied = ({ isMySubsScreen }: Props) => {
  const _handleOnPress = async () => await openSettings();
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  return (
    <View style={styles.container}>
      <KoreanParagraph
        text="앱 알림 설정이 꺼져 있습니다"
        textStyle={styles.textStyle}
        paragraphStyle={styles.paragraphStyle}
      />
      {isMySubsScreen && (
        <KoreanParagraph
          text="구독 키워드 알림을 받으시려면 앱 알림 설정을 허용해 주세요"
          textStyle={styles.descTextStyle}
          paragraphStyle={styles.paragraphStyle}
        />
      )}

      <ThemedButton mode="contained" color={getThemeColor('accent', appearance)} onPress={_handleOnPress}>
        <Text style={styles.buttonTextStyle}>설정 변경</Text>
      </ThemedButton>
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: getThemeColor('disabled', appearance),
      width: '100%',
      height: 100,
      marginBottom: theme.size.small,
      borderRadius: 10,
    },
    textStyle: { color: getThemeColor('error', appearance), fontSize: theme.fontSize.normal, fontWeight: '700' },
    descTextStyle: { color: getThemeColor('text', appearance), fontSize: theme.fontSize.medium, fontWeight: 'normal' },
    paragraphStyle: { marginBottom: theme.size.small },
    buttonTextStyle: { color: getThemeColor('background', appearance), fontWeight: 'bold' },
  });

export default NotiPermissionDenied;
