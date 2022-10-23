import React from 'react';
import theme, { getTheme } from '../configs/theme';
import { Text, View, StyleSheet } from 'react-native';
import { AppearanceType } from '../types/store';
interface Props {
  appearance: AppearanceType;
}
const ClassSummaryDataTableHeader = ({ appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={[styles.viewContainer, styles.flex3, styles.fontSize]}>구분</Text>

      <Text style={[styles.viewContainer, styles.flex9, styles.text, styles.fontSize]}>입력 내용</Text>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', borderColor: theme.colors.backdrop, borderBottomWidth: 1 },
    viewContainer: {
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingVertical: theme.size.xs,
      color: theme.colors.text,
    },
    fontSize: { fontSize: theme.fontSize.medium, color: theme.colors.backdrop },
    text: { alignSelf: 'center', justifyContent: 'center' },
    flex3: { flex: 3 },
    flex9: { flex: 9 },
  });

export default ClassSummaryDataTableHeader;
