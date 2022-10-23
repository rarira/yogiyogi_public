import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClassSortType } from '../../stores/ClassStore';
import KeyboardDismissButton from '../KeyboardDismissButton';
import MyHeadline from '../MyHeadline';
import SearchButton from '../SearchButton';
import SearchSortMenu from './SearchSortMenu';
import { AppearanceType } from '../../types/store';
import theme from '../../configs/theme';

interface Props {
  searchMode: string;
  keyword: string;
  detailSearchable: boolean;
  setResultVisible: (arg: boolean) => void;
  setClassSort: (arg: ClassSortType) => void;
  classSort: ClassSortType;
}

const SearchHeader = ({ searchMode, keyword, detailSearchable, setResultVisible, classSort, setClassSort }: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const _handleSearch = useCallback(() => setResultVisible(true), []);

  return (
    <View style={styles.container}>
      <MyHeadline>클래스 검색</MyHeadline>

      <View style={styles.buttonContainer}>
        <>
          <KeyboardDismissButton needMarginRight />

          <SearchSortMenu
            menuVisible={menuVisible}
            setMenuVisible={setMenuVisible}
            setClassSort={setClassSort}
            classSort={classSort}
          />
          {searchMode !== 'all' && (
            <View style={styles.leftMargin}>
              <SearchButton
                disabled={(searchMode === 'simple' && !keyword) || (searchMode === 'detail' && !detailSearchable)}
                onPress={_handleSearch}
                // allList={searchMode === 'simple' && variables.filter!.or && variables.filter!.or.length !== 0 && !keyword}
              />
            </View>
          )}
        </>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: theme.size.big,
    marginTop: theme.size.small,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  leftMargin: { marginLeft: theme.size.medium, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
});

export default memo(SearchHeader);
