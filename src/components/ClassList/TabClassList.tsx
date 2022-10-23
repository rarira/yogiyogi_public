import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import React, { useEffect, useState } from 'react';

import { ClassData } from '../../types/apiResults';
import EmptySeparator from '../EmptySeparator';
import FlatListEmptyResults from '../FlatListEmptyResults';
import FlatListFooter from '../FlatListFooter';
import Loading from '../Loading';
// import { SearchableSortDirection } from '../../API';
import TabClassCard from './TabClassCard';
import { WarningProps } from '../WarningDialog';
import { customListClasss } from '../../customGraphqls';
import getClassListVariables from '../../functions/getClassListVariables';
import getEmptyClassResultType from '../../functions/getEmptyClassResultType';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';

import { useQuery } from '@apollo/react-hooks';
import { AppearanceType } from '../../types/store';
import theme from '../../configs/theme';
import { SearchableSortDirection } from '../../API';

interface Props {
  type: string;
  tabLabel?: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  username: string;
  sort: SearchableSortDirection;
  appearance: AppearanceType;
}

const LIST_CLASS = gql(customListClasss);

const TabClassList = ({ type, tabLabel, snackbarDispatch, setWarningProps, username, sort, appearance }: Props) => {
  const [variables, setVariables] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // const variables = getClassListVariables(username, type, tabLabel!, sort);

  const { loading, error, data, fetchMore, refetch, networkStatus } = useQuery(LIST_CLASS, {
    variables,
    fetchPolicy: 'cache-and-network',
    // skip: !variables,
    // notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      const tempVariables = getClassListVariables(username, type, tabLabel!, sort);
      setVariables(tempVariables);
    }
  }, [username, type, tabLabel, sort]);

  const _keyExtractor = (item: ClassData) => item.id;

  // console.log(type, tabLabel, variables);
  // * Production

  if (!data || !data.searchClasss) {
    return <Loading origin="TabClassList" />;
  }
  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const _handleFetchMore = () => {
    if (data.searchClasss.nextToken) {
      fetchMore({
        variables: { nextToken: data.searchClasss.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) return prev;

          if (fetchMoreResult.searchClasss.nextToken === prev.searchClasss.nextToken) {
            return prev;
          }
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

  if (data.searchClasss.nextToken && data.searchClasss.items.length < 2) {
    _handleFetchMore();
  }

  const renderItem = ({ item }: { item: ClassData }) => {
    return (
      <TabClassCard
        item={item}
        refetch={refetch}
        origin={'ClassList'}
        type={type}
        setWarningProps={setWarningProps}
        isHost={item.host.id === username}
        appearance={appearance}
      />
    );
  };

  const renderItemSeparatorComponent = () => <EmptySeparator marginVerticalBig appearance={appearance} />;

  const renderEmptyResult = () => {
    if (!(data.searchClasss.nextToken && data.searchClasss.items.length < 2)) {
      return <FlatListEmptyResults type={getEmptyClassResultType(tabLabel)} />;
    }
    return null;
  };

  return (
    <FlatList
      data={data.searchClasss.items}
      keyExtractor={_keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.flatListContainer}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      ListEmptyComponent={renderEmptyResult}
      ListFooterComponent={
        <FlatListFooter loading={loading || networkStatus === 4} eolMessage="클래스 리스트의 끝" isEmpty={data.searchClasss.items.length === 0} />
      }
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
    paddingVertical: theme.size.big,

    // flex: 1,
  },
});

export default TabClassList;
// memo(TabClassList);
