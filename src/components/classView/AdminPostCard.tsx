import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import KoreanParagraph from '../KoreanParagraph';

import ThemedButton from '../ThemedButton';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  openAdminPostDialog(): void;
  appearance: AppearanceType;
  hasURL: boolean;
}

const AdminPostCard = ({ openAdminPostDialog, hasURL, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const text = hasURL ? '아래 버튼을 이용하여 공고를 먼저 확인하세요' : '전화, 문자, 이메일 등을 이용하여 직접 구인자와 연락하십시오.';

  return (
    <View style={styles.container}>
      <KoreanParagraph
        textStyle={styles.textStyle}
        paragraphStyle={styles.paragraphStyle}
        text={`외부의 구인 사이트 등에서 가져온 클래스입니다. ${text}`}
      />

      <ThemedButton mode="contained" color={theme.colors.error} onPress={openAdminPostDialog} style={styles.buttonStyle}>
        <Text style={styles.buttonText}>주의 사항 보기</Text>
      </ThemedButton>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      // flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: theme.size.big,
    },
    textStyle: {
      color: theme.colors.background,
      fontWeight: '800',
      fontSize: theme.fontSize.medium,
    },
    paragraphStyle: {
      marginHorizontal: theme.size.big,
    },
    buttonStyle: {
      justifyContent: 'flex-end',
      marginTop: theme.size.normal,
      marginBottom: theme.size.normal,
    },
    buttonText: {
      color: theme.colors.background,
      fontWeight: '800',
      fontSize: theme.fontSize.normal,
    },
  });

export default memo(withNavigation(AdminPostCard));
