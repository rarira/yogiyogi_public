import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../AccessDenied';
import { FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';

import AndroidDivider from '../AndroidDivider';
import FlatListEmptyResults from '../FlatListEmptyResults';
import FlatListFooter from '../FlatListFooter';
import Loading from '../Loading';
import { PostData } from '../../types/store';
import PostListCard from '../comm/PostListCard';
import { customListBookmarkedPost } from '../../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import theme from '../../configs/theme';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';

interface MyBookmarkedPostListProps {}

const LIST_BOOKMARKED_POSTS = gql(customListBookmarkedPost);

const MyBookmarkedPostList = () => {
  const [bookmarkedPostIdList, setBookmarkedPostIdList] = useState<string[]>([]);
  const { loading, data, error, refetch } = useQuery(LIST_BOOKMARKED_POSTS, {
    variables: { ids: bookmarkedPostIdList },
    fetchPolicy: 'cache-and-network',
    skip: bookmarkedPostIdList.length === 0,
  });

  const {
    authStore: { postBookmark },
  } = useStoreState();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let _mounted = true;

    if (postBookmark?.count > 0) {
      const temp = { ...postBookmark };
      delete temp.count;
      delete temp.used;
      let tempArray = Object.keys(temp);

      if (_mounted) {
        setBookmarkedPostIdList(tempArray);
      }
    }
    return () => {
      _mounted = false;
    };
  }, [postBookmark]);

  const _keyExtractor = (item: PostData) => item.id;

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

  const renderItem = ({ item }: { item: PostData }) => {
    return <PostListCard item={item} origin={'BookmarkList'} />;
  };

  const renderItemSeparatorComponent = () => <AndroidDivider needMarginHorizontal needMarginVertical />;

  if (postBookmark.count === 0) return <FlatListEmptyResults type="북마크한 게시물이" />;

  if (!data || !data.listBookmarkedPost) {
    return <Loading origin="BookmarkListScreen_post" />;
  }

  if (error) {
    reportSentry(error);
    return <AccessDenied category={AccessDeniedReason.Error} target={AccessDeniedTarget.Error} />;
  }

  return (
    <FlatList
      // alwaysBounceVertical={false}
      data={data.listBookmarkedPost}
      keyExtractor={_keyExtractor}
      keyboardShouldPersistTaps="handled"
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      // ListEmptyComponent={<FlatListEmptyResults type="북마크한 클래스가" />}
      ListFooterComponent={<FlatListFooter loading={loading} eolMessage="북마크 게시물 리스트의 끝" isEmpty={data.listBookmarkedPost.length === 0} />}
      keyboardDismissMode="on-drag"
      refreshing={refreshing}
      onRefresh={_handleRefreshControl}
    />
  );
};

export default MyBookmarkedPostList;

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.size.normal,
  },
});
