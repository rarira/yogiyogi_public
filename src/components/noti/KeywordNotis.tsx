import { FlatList, RefreshControl } from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import { queryNewClassNotis, updateNewClassNotiStore } from '../../functions/manageNewClassNotis';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import EmptySeparator from '../EmptySeparator';
import FlatListEmptyResults from '../FlatListEmptyResults';
import KeywordNotiCard from './KeywordNotiCard';
import Loading from '../Loading';
import { NewClassNotiType } from '../../types/store';
import { SET_AUTHSTORE_STATE } from '../../stores/actionTypes';
import { customKeywordClasss } from '../../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';

import { useLazyQuery } from '@apollo/react-hooks';
import { getTheme } from '../../configs/theme';
import { sub } from 'react-native-reanimated';

interface Props {
  isFocused: boolean;
}

const SEARCH_CLASS = gql(customKeywordClasss);

const QUERY_LIMIT = 30;

const KeywordNotis = ({ isFocused }: Props) => {
  // const [variables, setVariables] = useState<any>(null);
  const {
    authStore: {
      // user: { username },
      newClassNotis,
      subscribedTags,
      newClassNotisAvailable,
      lastSubscribedTagsUpdated,
      appState,
      appearance,
    },
  } = useStoreState();
  const theme = getTheme(appearance);
  const [refreshing, setRefreshing] = useState(false);

  const styles = {
    container: {
      flex: 1,
      marginVertical: theme.size.medium,
      // // paddingVertical: theme.size.medium,
      // borderColor: 'red',
      // borderWidth: 1,
    },
    flatListContentContainer: {
      // marginVertical: theme.size.medium,
      marginHorizontal: theme.size.big,
    },
  };

  const storeDispatch = useStoreDispatch();
  const [loadingNotis, { loading, data, error, fetchMore, networkStatus, refetch }] = useLazyQuery(SEARCH_CLASS, {
    fetchPolicy: 'network-only',
    // variables,
    // skip: !newClassNotis.lastTime,
  });

  // console.log(loading, data, error);
  useEffect(() => {
    let _mounted = true;
    if (isFocused && _mounted && appState === 'active') {
      if (subscribedTags.length > 0) {
        queryNewClassNotis(loadingNotis, subscribedTags, newClassNotis, QUERY_LIMIT, lastSubscribedTagsUpdated);
      }
      if (newClassNotisAvailable) {
        storeDispatch({
          type: SET_AUTHSTORE_STATE,
          newClassNotisAvailable: false,
        });
      }

      return () => {
        _mounted = false;
      };
    }
  }, [newClassNotisAvailable, subscribedTags, isFocused, appState]);

  useEffect(() => {
    if (!!data && !!subscribedTags) {
      updateNewClassNotiStore(data, newClassNotis, subscribedTags, storeDispatch);
    }
  }, [data]);

  const _handleFetchMore = () => {
    if (data?.searchClasss?.nextToken) {
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

  if ((!newClassNotis || newClassNotis.items.length === 0) && (!subscribedTags || subscribedTags.length === 0)) {
    return subscribedTags && <FlatListEmptyResults type="새로운 키워드 알림이" />;
  }

  if (networkStatus === 4) return <Loading origin="KeywordNotis" />;

  if (error) console.log(error);

  console.log('noti data', data);
  const _keyExtractor = (item: NewClassNotiType) => item.classId;

  const renderItemSeparatorComponent = () => <EmptySeparator appearance={appearance} />;

  const renderItem = ({ item }: { item: NewClassNotiType }) => {
    return <KeywordNotiCard item={item} />;
  };

  // const finalData = modifiedData ?? [].concat(newClassNotis?.items ?? []);

  return (
    <FlatList
      data={newClassNotis.items}
      // scrollEnabled
      // alwaysBounceVertical={false}
      keyExtractor={_keyExtractor}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={20}
      renderItem={renderItem}
      contentContainerStyle={styles.flatListContentContainer}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      ListEmptyComponent={<FlatListEmptyResults type="새로운 키워드 알림이" />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
      // ListFooterComponent={<FlatListFooter isEmpty={newClassNotis.length === 0} eolMessage="키워드 알림 리스트의 끝" />}
      keyboardDismissMode="on-drag"
      onEndReached={_handleFetchMore}
      onEndReachedThreshold={2}
      style={styles.container}
    />
  );
};

export default memo(KeywordNotis);
