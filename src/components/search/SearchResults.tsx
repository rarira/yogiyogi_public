import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import React, { useEffect, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';

import { ClassData } from '../../types/apiResults';
import EmptySeparator from '../EmptySeparator';
import { FlatList } from 'react-native-gesture-handler';
import FlatListEmptyResults from '../FlatListEmptyResults';
import FlatListFooter from '../FlatListFooter';
import Loading from '../Loading';
import { SearchClasssQueryVariables } from '../../API';
import SearchResultsRenderItem from './SearchResultsRenderItem';
import { customSearchClasss } from '../../customGraphqls';
import gql from 'graphql-tag';
import guestClient from '../../configs/guestClient';
import reportSentry from '../../functions/reportSentry';
import theme from '../../configs/theme';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';

interface Props {
  variables: SearchClasssQueryVariables;
  searchMode: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setNeedAuthVisible: (arg: boolean) => void;
  resultVisible: boolean;
  origin: string;
  isFocused: boolean;
}

const SEARCH_CLASS = gql(customSearchClasss);

const SearchResults = ({ variables, searchMode, snackbarDispatch, resultVisible, setNeedAuthVisible, origin, isFocused }: Props) => {
  if (searchMode !== 'all' && !resultVisible) return null;

  const {
    authStore: { user, appState, appearance },
  } = useStoreState();
  const [refreshing, setRefreshing] = useState(false);

  const { loading, error, data, fetchMore, refetch, networkStatus } = useQuery(SEARCH_CLASS, {
    variables,
    fetchPolicy: 'cache-and-network',
    ...(!user && { client: guestClient }),
  });

  const renderItemSeparatorComponent = () => <EmptySeparator appearance={appearance} />;

  const _keyExtractor = (item: ClassData) => item.id;

  const _handleOnRefresh = async () => {
    try {
      await refetch();
      // console.log('searchResuls refetched');
    } catch (e) {
      reportSentry(e);
    }
  };

  useEffect(() => {
    let _mounted = true;
    if (_mounted && isFocused && appState === 'active') {
      _handleOnRefresh();
    }
    return () => {
      _mounted = false;
    };
  }, [appState, isFocused]);

  const renderItem = ({ item, index }: { item: ClassData; index: number }) => (
    <SearchResultsRenderItem item={item} index={index} setNeedAuthVisible={setNeedAuthVisible} origin={origin} appearance={appearance} />
  );

  // * Production

  if (!data || !data.searchClasss) {
    // console.log('when loading', data);
    return <Loading origin="SearchResults" />;
  }

  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  // * 개발용 임시 데이터
  // const { data } = require('../../static/devOnly/searchResult.json');
  // const loading = false;

  const _handleFetchMore = () => {
    if (data.searchClasss.nextToken) {
      fetchMore({
        variables: { nextToken: data.searchClasss.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) return prev;

          if (fetchMoreResult.searchClasss.nextToken === prev.searchClasss.nextToken) return prev;
          return {
            searchClasss: {
              items: [...prev.searchClasss.items, ...fetchMoreResult.searchClasss.items],
              nextToken: fetchMoreResult.searchClasss.nextToken,
              __typename: prev.searchClasss.__typename,
            },
          };
        },
      });
    }
  };

  const _handleRefreshControl = () => {
    setRefreshing(true);
    refetch()
      .then(result => {
        setRefreshing(false);
      })
      .catch(error => {
        reportSentry(error);
        setRefreshing(false);
      });
  };

  return (
    <FlatList
      data={data.searchClasss.items}
      keyExtractor={_keyExtractor}
      keyboardShouldPersistTaps="handled"
      renderItem={renderItem}
      contentContainerStyle={styles.flatListContainer}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      ListEmptyComponent={<FlatListEmptyResults type={`${searchMode === 'simple' ? '검색어와' : '검색 조건과'} 일치하는 클래스가`} />}
      ListFooterComponent={<FlatListFooter loading={loading} eolMessage="검색 결과의 끝" isEmpty={data.searchClasss.items.length === 0} />}
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
      onEndReached={_handleFetchMore}
      onEndReachedThreshold={5}
      removeClippedSubviews={true}
      maxToRenderPerBatch={20}
    />
  );
};

const styles = StyleSheet.create({
  flatListContainer: {
    paddingBottom: theme.size.normal,
  },
  itemConatiner: { flexDirection: 'column' },
});

export default SearchResults;
//  memo(SearchResults);
