import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationFocusInjectedProps, withNavigationFocus } from 'react-navigation';
import { PostCategory, PostStatus } from '../../API';
import React, { memo, useEffect, useState } from 'react';
import { customListPostsByCategory, customOnCreatePostCategory } from '../../customGraphqls';
import { useQuery, useSubscription } from '@apollo/react-hooks';

import AndroidDivider from '../AndroidDivider';
import FlatListEmptyResults from '../FlatListEmptyResults';
import FlatListFooter from '../FlatListFooter';
import Loading from '../Loading';
import { PostData } from '../../types/store';
import PostListCard from './PostListCard';
import getPostCategory from '../../functions/getPostCategory';
import gql from 'graphql-tag';
import guestClient from '../../configs/guestClient';
import isEqual from 'react-fast-compare';
import produce from 'immer';
import reportSentry from '../../functions/reportSentry';
import theme from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationFocusInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
  queryCategory: PostCategory;
}
const LIST_POSTS = gql(customListPostsByCategory);
const SUBSCRIBE_TO_POST_CREATE_CATEGORY = gql(customOnCreatePostCategory);

const PostListByCategory = ({ snackbarDispatch, queryCategory, isFocused }: Props) => {
  const {
    authStore: { user, appState },
  } = useStoreState();
  const [refreshing, setRefreshing] = useState(false);

  const variables = {
    postCategory: queryCategory,
    limit: 30,
    sortDirection: 'DESC',
    filter: { postStatus: { eq: PostStatus.open } },
  };
  const { loading, error, data, fetchMore, refetch, networkStatus } = useQuery(LIST_POSTS, {
    variables,
    // skip: !breed,
    notifyOnNetworkStatusChange: true,
    ...(!user && { client: guestClient }),
  });

  useSubscription(SUBSCRIBE_TO_POST_CREATE_CATEGORY, {
    variables: { postCategory: queryCategory },
    ...(!user && { client: guestClient }),

    onSubscriptionData: options => {
      try {
        // console.log(`onCreatePostCategory subscribed _ ${queryCategory}`);
        const { onCreatePostCategory } = options.subscriptionData.data;
        const queryResult: any = options.client.readQuery({
          query: LIST_POSTS,
          variables,
        });

        const { items, ...others } = queryResult.listPostsByCategory;
        if (!items[0] || items[0].id !== onCreatePostCategory.id) {
          // console.log('subscription data fetches new message: ', onCreatePostCategory);

          const nextItems = produce(items, (draft: any) => {
            draft.unshift(onCreatePostCategory);
          });

          const newData = { listPostsByCategory: { items: nextItems, ...others } };
          options.client.writeQuery({ query: LIST_POSTS, variables, data: newData });
        }
      } catch (e) {
        reportSentry(e);
      }
    },
  });

  const _handleRefetch = async () => {
    try {
      // console.log('call refetch');
      await refetch();
    } catch (e) {
      reportSentry(e);
    }
  };
  useEffect(() => {
    let _mounted = true;

    if (isFocused && _mounted && appState === 'active') {
      // if (origin !== 'ChatList') {
      _handleRefetch();
      // }
    }

    return () => {
      _mounted = false;
    };
  }, [isFocused, appState, queryCategory]);

  if (!data || !data.listPostsByCategory) {
    return <Loading origin="PostListByCategory" />;
  }
  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const _keyExtractor = (item: PostData) => item.id;

  const _handleFetchMore = () => {
    if (data.listPostsByCategory.nextToken) {
      fetchMore({
        variables: { nextToken: data.listPostsByCategory.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) return prev;

          if (fetchMoreResult.listPostsByCategory.nextToken === prev.listPostsByCategory.nextToken) {
            return prev;
          }
          return {
            listPostsByCategory: {
              items: [...prev.listPostsByCategory.items, ...fetchMoreResult.listPostsByCategory.items],
              nextToken: fetchMoreResult.listPostsByCategory.nextToken,
              __typename: prev.listPostsByCategory.__typename,
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

  if (data.listPostsByCategory.nextToken && data.listPostsByCategory.items.length < 2) {
    _handleFetchMore();
  }

  const renderItem = ({ item }: { item: PostData }) => {
    return <PostListCard item={item} origin={'Comm'} />;
  };

  const renderItemSeparatorComponent = () => <AndroidDivider needMarginHorizontal needMarginVertical />;
  const renderEmptyResult = () => <FlatListEmptyResults type={`${queryCategory ? `${getPostCategory(queryCategory)} ` : ''}게시물이`} />;

  return (
    <FlatList
      data={data.listPostsByCategory.items}
      keyExtractor={_keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.flatListContainer}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      ListEmptyComponent={renderEmptyResult}
      ListFooterComponent={
        <FlatListFooter
          loading={loading || networkStatus === 4}
          eolMessage={`${queryCategory ? `${getPostCategory(queryCategory)} ` : ''} 게시물 리스트의 끝`}
          isEmpty={data.listPostsByCategory.items.length === 0}
        />
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
    paddingTop: theme.size.normal,
    paddingBottom: theme.size.big,
    // marginHorizontal: theme.size.big,

    // flex: 1,
  },
});

export default memo(withNavigationFocus(PostListByCategory), isEqual);
