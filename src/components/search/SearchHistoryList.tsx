import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import FlatListEmptyResults from '../FlatListEmptyResults';
import ListSeparator from '../ListSeparator';
import React from 'react';
import { SearchHistory } from '../../stores/ClassStore';
import SearchHistoryCard from './SearchHistoryCard';
import { resetSearchHistorys } from '../../functions/manageSearchHistory';

import ThemedButton from '../ThemedButton';
import theme, { getThemeColor } from '../../configs/theme';

interface Props {
  searchMode: string;
  dispatch: (arg: {}) => void;
  resultVisible: boolean;
}

const SearchHistoryList = ({ searchMode, dispatch, resultVisible }: Props) => {
  const { authStore } = useStoreState();
  const { user, appearance } = authStore;

  const storeDispatch = useStoreDispatch();
  const type = searchMode === 'simple' ? 'simpleSearchHistory' : 'detailSearchHistory';
  const searchHistory = authStore[type];

  if (resultVisible) return null;

  const _handleReset = () => {
    resetSearchHistorys({
      type,
      storeDispatch,
    });
  };

  const _keyExtractor = (item: SearchHistory) => `${item.searchedAt}`;

  const renderItem = ({ item, index }: { item: SearchHistory; index: number }) => {
    return <SearchHistoryCard item={item} searchMode={searchMode} dispatch={dispatch} index={index} />;
  };

  const renderItemSeparatorComponent = () => <ListSeparator marginVerticalSmall appearance={authStore.appearance} />;

  return (
    <>
      <View style={styles.container}>
        <Text style={{ color: getThemeColor('text', appearance) }}>최근 검색 기록</Text>
        <ThemedButton mode="text" compact onPress={_handleReset}>
          모두 삭제
        </ThemedButton>
      </View>
      <FlatList
        data={searchHistory}
        alwaysBounceVertical={false}
        keyExtractor={_keyExtractor}
        keyboardShouldPersistTaps="handled"
        renderItem={renderItem}
        ItemSeparatorComponent={renderItemSeparatorComponent}
        contentContainerStyle={styles.flatListContainer}
        ListEmptyComponent={
          <FlatListEmptyResults
            type="검색 기록이"
            showWarning={!user}
            warnings="게스트 사용자는 검색 기록이 저장되지 않습니다"
          />
        }
        keyboardDismissMode="on-drag"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: theme.size.big,
  },
  flatListContainer: {
    marginBottom: theme.size.normal,
    marginHorizontal: theme.size.big,
  },
});
export default SearchHistoryList;
