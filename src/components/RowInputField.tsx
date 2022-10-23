import { View, StyleSheet, Text } from 'react-native';

import FocusText from './FocusText';

import SingleLineInputField from './SingleLineInputField';
import React, { memo, useCallback } from 'react';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';
interface Props {
  focusBlur: boolean;
  setFocusBlur: (arg: boolean) => void;
  suffix: boolean;
  name: string;
  appearance: AppearanceType;
}

const RowInputField = ({ focusBlur, setFocusBlur, suffix, name, appearance }: Props) => {
  const tintColor = getThemeColor('focus', appearance);
  const styles = getThemedStyles(appearance);

  const handleOnFocus = useCallback(() => setFocusBlur(false), []);
  const handleOnBlur = useCallback(() => setFocusBlur(true), []);

  return (
    <View style={styles.container}>
      <View style={styles.labelText}>
        <FocusText blur={focusBlur} appearance={appearance}>
          클래스 타임수 입력
        </FocusText>
      </View>
      <View style={styles.inputField}>
        <SingleLineInputField
          label="총 클래스 횟수"
          labelTextStyle={styles.displayNone}
          labelHeight={0}
          tintColor={tintColor}
          required
          name={name}
          type="digits"
          keyboardType="numeric"
          style={{ textAlign: 'right' }}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
        />
      </View>
      <Text style={styles.suffixText}>{suffix ? '타임' : '타임/1주'}</Text>
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.size.small,
    },
    labelText: {
      height: 50,
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginRight: theme.size.normal,
    },
    inputField: { flex: 1, height: 40, justifyContent: 'center', marginHorizontal: theme.size.small },
    displayNone: { display: 'none' },
    suffixText: { fontSize: theme.fontSize.small, color: getThemeColor('text', appearance) },
  });
export default memo(RowInputField);
