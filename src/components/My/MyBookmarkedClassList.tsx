import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../AccessDenied';
import { FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';

import ClassCard from '../search/ClassCard';
import { ClassData } from '../../types/apiResults';
import EmptySeparator from '../EmptySeparator';
import FlatListEmptyResults from '../FlatListEmptyResults';
import FlatListFooter from '../FlatListFooter';
import Loading from '../Loading';
import { customListBookmarkedClass } from '../../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import theme from '../../configs/theme';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';

const LIST_BOOKMARKED_CLASS = gql(customListBookmarkedClass);

const MyBookmarkedClassList = () => {
  const [bookmarkedClassIdList, setBookmarkedClassIdList] = useState<string[]>([]);
  const { loading, data, error, refetch } = useQuery(LIST_BOOKMARKED_CLASS, {
    variables: { ids: bookmarkedClassIdList },
    fetchPolicy: 'cache-and-network',
    skip: bookmarkedClassIdList.length === 0,
  });

  const {
    authStore: { bookmark, appearance },
  } = useStoreState();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let _mounted = true;

    if (bookmark?.count > 0) {
      const temp = { ...bookmark };
      delete temp.count;
      delete temp.used;
      let tempArray = Object.keys(temp);
      if (_mounted) {
        setBookmarkedClassIdList(tempArray);
      }
    }
    return () => {
      _mounted = false;
    };
  }, [bookmark]);

  const _keyExtractor = (item: ClassData) => item.id;

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

  if (bookmark.count === 0) return <FlatListEmptyResults type="북마크한 클래스가" />;

  if (!data || !data.listBookmarkedClass) {
    return <Loading origin="BookmarkListScreen_class" />;
  }

  if (error) {
    reportSentry(error);
    return <AccessDenied category={AccessDeniedReason.Error} target={AccessDeniedTarget.Error} />;
  }

  const renderItem = ({ item }: { item: ClassData }) => {
    return <ClassCard item={item} origin={'BookmarkList'} appearance={appearance} />;
  };

  return (
    <FlatList
      // alwaysBounceVertical={false}
      data={data.listBookmarkedClass}
      keyExtractor={_keyExtractor}
      keyboardShouldPersistTaps="handled"
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={EmptySeparator}
      // ListEmptyComponent={<FlatListEmptyResults type="북마크한 클래스가" />}
      ListFooterComponent={
        <FlatListFooter loading={loading} eolMessage="북마크 클래스 리스트의 끝" isEmpty={data.listBookmarkedClass.length === 0} />
      }
      keyboardDismissMode="on-drag"
      refreshing={refreshing}
      onRefresh={_handleRefreshControl}
    />
  );
};

export default MyBookmarkedClassList;

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.size.normal,
  },
});
