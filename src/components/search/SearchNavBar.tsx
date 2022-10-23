import React, { ReducerAction, memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Checkbox } from 'react-native-paper';
import SelectSearchMode from './SelectSearchMode';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  searchMode: string;
  openOnly: boolean;
  termDispatch: (arg: ReducerAction<any>) => void;
  appearance: AppearanceType;
}

const SearchNavBar = ({ searchMode, openOnly, termDispatch, appearance }: Props) => {
  const _toggleCheckBox = () =>
    termDispatch({
      type: 'setTermState',
      openOnly: !openOnly,
      // classSort: bool ? ClassSortType.timeStartASC : ClassSortType.timeStartDESC,
    });
  const _handleSearchMode = useCallback((searchMode: string) => termDispatch({ type: 'setSearchMode', searchMode }), [
    termDispatch,
  ]);

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.container}>
      <SelectSearchMode searchMode={searchMode} handleSearchMode={_handleSearchMode} appearance={appearance} />
      <View style={styles.searchBar}>
        <Checkbox.Android
          status={openOnly ? 'checked' : 'unchecked'}
          onPress={_toggleCheckBox}
          color={theme.colors.accent}
          uncheckedColor={theme.colors.disabled}
        />
        <Text style={styles.fontSmall}>구인 중인 클래스만</Text>
      </View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginVertical: theme.size.small,
      marginHorizontal: theme.size.big,
      marginTop: theme.size.small,
    },

    searchBar: { flexDirection: 'row', alignItems: 'center' },
    fontSmall: { fontSize: theme.fontSize.small, color: theme.colors.placeholder },
  });

export default memo(SearchNavBar);
