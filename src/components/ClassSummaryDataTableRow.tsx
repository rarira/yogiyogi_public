import React, { memo } from 'react';

import theme, { getTheme } from '../configs/theme';
import { Text, View, StyleSheet } from 'react-native';
import ThemedButton from './ThemedButton';
import { AppearanceType } from '../types/store';

interface Props {
  property: string;
  value: string | Element;
  onPress?: () => void;
  style?: any;
  appearance: AppearanceType;
}

const ClassSummaryDataTableRow = ({ property, value, onPress, style, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  return (
    <View style={[styles.container, style ? style.container : {}]}>
      <View style={[styles.viewContainer, styles.flex3, style ? style.property : {}]}>
        <Text style={styles.fontSize}>{property}</Text>
      </View>

      {typeof value === 'string' ? (
        <Text style={[styles.viewContainer, styles.flex7, styles.text, styles.fontSize, style ? style.valueText : {}]}>
          {value}
        </Text>
      ) : (
        // </View>
        <View style={[styles.viewContainer, styles.flex7, style ? style.value : {}]}>{value}</View>
      )}

      {onPress && (
        <View style={styles.buttonContainer}>
          <ThemedButton mode="text" onPress={onPress} compact>
            <Text style={[styles.fontSize, styles.flex2]}>수정</Text>
          </ThemedButton>
        </View>
      )}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', borderColor: theme.colors.grey200, borderBottomWidth: 1 },
    viewContainer: {
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingVertical: theme.size.xs,
    },
    buttonContainer: { flex: 2, justifyContent: 'center', alignItems: 'flex-end', padding: 0 },
    text: { flexWrap: 'wrap', alignSelf: 'center' },
    fontSize: { fontSize: theme.fontSize.medium, color: theme.colors.text },
    flex2: { flex: 2 },
    flex3: { flex: 3 },
    flex7: { flex: 7 },
  });

export default memo(ClassSummaryDataTableRow);
