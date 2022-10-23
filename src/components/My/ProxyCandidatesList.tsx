import { ApolloQueryResult, NetworkStatus } from 'apollo-client';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import React, { memo, useEffect, useState } from 'react';

import { DocumentNode } from 'apollo-link';
import FlatListEmptyResults from '../FlatListEmptyResults';
import { OperationVariables } from '@apollo/react-common';
import ProxyCandidateCard from './ProxyCandidateCard';
import { SearchProxyItem } from '../../types/apiResults';
import reportSentry from '../../functions/reportSentry';

import uniqBy from 'lodash/uniqBy';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';
import { RefetchQueryDescription } from 'apollo-client/core/watchQueryOptions';

interface Props {
  data: any;
  refetch: any;
  initialNumToRender: number;
  fetchMore: ({
    query,
    variables,
    updateQuery,
  }: {
    query?: DocumentNode;
    variables?: OperationVariables;
    updateQuery: any;
  }) => Promise<ApolloQueryResult<SearchProxyItem[]>>;
  origin: string;
  hostId?: string;
  classId: string;
  appearance: AppearanceType;
}

const _getCandidate = (item: SearchProxyItem, hostId: string | undefined) => {
  if (!hostId) {
    return item.user2;
  } else {
    if (item.user1.id !== hostId) {
      return item.user1;
    } else {
      return item.user2;
    }
  }
};

const ProxyCandidatesList = ({ data, refetch, initialNumToRender, fetchMore, origin, hostId, classId, appearance }: Props) => {
  const items = data?.searchConvs?.items;
  const [condensedCandidates, setCondensedCandidates] = useState<SearchProxyItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && items) {
      const newArray = uniqBy(items, (item: SearchProxyItem) => {
        const partner = _getCandidate(item, hostId);
        return partner.id;
      });
      setCondensedCandidates(newArray);
    }
    return () => {
      _mounted = false;
    };
  }, [items]);

  const _keyExtractor = (item: SearchProxyItem) => {
    return item.id;
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

  const _handleFetchMore = () => {
    if (data.searchConvs.nextToken !== null) {
      fetchMore({
        variables: { nextToken: data.searchConvs.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) return prev;
          if (fetchMoreResult.searchConvs.nextToken === prev.searchConvs.nextToken) {
            return prev;
          }

          return Object.assign({}, prev, {
            searchConvs: {
              items: [...prev.searchConvs.items, ...fetchMoreResult.searchConvs.items],
              nextToken: fetchMoreResult.searchConvs.nextToken,
              __typename: prev.searchConvs.__typename,
            },
          });
        },
      });
    }
  };

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const renderItem = ({ item }: { item: SearchProxyItem }) => {
    return (
      <View style={styles.cardContainer}>
        <ProxyCandidateCard candidate={_getCandidate(item, hostId)} classId={classId} origin={origin} />
      </View>
    );
  };

  return (
    <FlatList
      data={condensedCandidates}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyExtractor={_keyExtractor}
      renderItem={renderItem}
      refreshing={refreshing}
      onRefresh={_handleRefreshControl}
      ListEmptyComponent={<FlatListEmptyResults type="진행된 채팅이" />}
      initialNumToRender={initialNumToRender}
      // scrollEnabled
      contentContainerStyle={styles.contentContainer}
      onEndReached={_handleFetchMore}
      onEndReachedThreshold={2}
    />
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    contentContainer: { flexGrow: 1, backgroundColor: theme.colors.background, paddingBottom: theme.size.big },
    cardContainer: { backgroundColor: theme.colors.background },
  });
export default memo(ProxyCandidatesList);
