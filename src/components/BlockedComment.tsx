import { StyleSheet, Text, View } from 'react-native';

import React from 'react';

import { AppearanceType } from '../types/store';
import { getTheme } from '../configs/theme';

interface Props {
  isBlockedByYou: boolean;
  type?: string;
  appearance: AppearanceType;
}

const BlockedComment = ({ isBlockedByYou, type, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.blockedText}>
        {isBlockedByYou ? `당신이 차단한 사용자의 ${type ?? '댓글'}입니다` : `${type ?? '댓글'} 접근이 차단되었습니다`}
      </Text>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      padding: theme.size.small,
      alignItems: 'center',
    },
    blockedText: {
      fontSize: theme.fontSize.medium,
      color: theme.colors.error,
      alignItems: 'center',
    },
  });
export default BlockedComment;
