import React, { ReducerAction, memo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import theme, { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  keyword: string;
  termDispatch: (arg: ReducerAction<any>) => void;
  appearance: AppearanceType;
}

const SearchField = ({ termDispatch, keyword, appearance }: Props) => {
  const setResultVisible = (arg: boolean) => {
    termDispatch({ type: 'setResultVisible', resultVisible: arg });
  };
  const _handleOnFocus = () => setResultVisible(false);
  const _hanldeOnSubmit = () => setResultVisible(true);

  const _handleOnChangeText = (text: string) => termDispatch({ type: 'setKeyword', keyword: text });

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.flex1}>
      <TextInput
        placeholder="검색할 단어를 입력하세요"
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.textInput}
        clearButtonMode="while-editing"
        onChangeText={_handleOnChangeText}
        value={keyword}
        onFocus={_handleOnFocus}
        onSubmitEditing={_hanldeOnSubmit}
        returnKeyType="search"
      />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    flex1: { flex: 1, marginRight: theme.size.small },
    textInput: {
      fontSize: theme.fontSize.subheading,
      borderBottomColor: theme.colors.primary,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingVertical: theme.size.small,
      color: theme.colors.text,
    },
    buttonContainer: { justifyContent: 'center', alignItems: 'center' },
  });

export default memo(SearchField);
