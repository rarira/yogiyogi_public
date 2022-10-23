import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationFocusInjectedProps, withNavigationFocus } from 'react-navigation';
import React, { useEffect, useState } from 'react';
import { customListPostsByType, customOnCreatePostType } from '../../customGraphqls';
import { useQuery, useSubscription } from '@apollo/react-hooks';

import AndroidDivider from '../AndroidDivider';
import FlatListEmptyResults from '../FlatListEmptyResults';
import FlatListFooter from '../FlatListFooter';
import Loading from '../Loading';
import { PostData } from '../../types/store';
import PostListCard from './PostListCard';
import { PostStatus } from '../../API';
import gql from 'graphql-tag';
import guestClient from '../../configs/guestClient';
// import isEqual from 'react-fast-compare';
import produce from 'immer';
import reportSentry from '../../functions/reportSentry';
import theme from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationFocusInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}
const LIST_POSTS = gql(customListPostsByType);
const SUBSCRIBE_TO_POST_CREATE_TYPE = gql(customOnCreatePostType);
const variables = {
  postType: 'comm',
  limit: 30,
  sortDirection: 'DESC',
  filter: { postStatus: { eq: PostStatus.open } },
};

const PostList = ({ snackbarDispatch, isFocused }: Props) => {
  const {
    authStore: { user, appState },
  } = useStoreState();

  const [refreshing, setRefreshing] = useState(false);

  const { loading, error, data, fetchMore, refetch, networkStatus } = useQuery(LIST_POSTS, {
    variables,
    // skip: !breed,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    ...(!user && { client: guestClient }),
  });

  // console.log(networkStatus, refreshing);

  const subs = useSubscription(SUBSCRIBE_TO_POST_CREATE_TYPE, {
    variables: { postType: 'comm' },
    ...(!user && { client: guestClient }),
    onSubscriptionData: options => {
      try {
        const { onCreatePostType } = options.subscriptionData.data;
        const queryResult: any = options.client.readQuery({
          query: LIST_POSTS,
          variables,
        });

        const { items, ...others } = queryResult.listPostsByType;
        if (!items[0] || items[0].id !== onCreatePostType.id) {
          // console.log('subscription data fetches new message: ', onCreatePostType);

          const nextItems = produce(items, (draft: any) => {
            draft.unshift(onCreatePostType);
          });

          const newData = { listPostsByType: { items: nextItems, ...others } };
          options.client.writeQuery({ query: LIST_POSTS, variables, data: newData });
        }
      } catch (e) {
        reportSentry(e);
      }
    },
  });

  const _handleRefetch = async () => {
    try {
      await refetch();
    } catch (e) {
      reportSentry(e);
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

  useEffect(() => {
    let _mounted = true;

    if (isFocused && _mounted && appState === 'active') {
      // if (origin !== 'ChatList') {

      _handleRefetch();
      // }
    }

    return () => {
      _mounted = false;
      subs;
    };
  }, [isFocused, appState]);

  if (!data || !data.listPostsByType) {
    return <Loading origin="PostList" />;
  }
  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const _keyExtractor = (item: PostData) => item.id;

  const _handleFetchMore = () => {
    if (data.listPostsByType.nextToken) {
      fetchMore({
        variables: { nextToken: data.listPostsByType.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) return prev;

          if (fetchMoreResult.listPostsByType.nextToken === prev.listPostsByType.nextToken) {
            return prev;
          }
          return {
            listPostsByType: {
              items: [...prev.listPostsByType.items, ...fetchMoreResult.listPostsByType.items],
              nextToken: fetchMoreResult.listPostsByType.nextToken,
              __typename: prev.listPostsByType.__typename,
            },
          };
        },
      });
    }
  };

  if (data.listPostsByType.nextToken && data.listPostsByType.items.length < 2) {
    _handleFetchMore();
  }

  const renderItem = ({ item }: { item: PostData }) => {
    // if (!item.blockedBy || !item.blockedBy.includes(user.username)) {
    return <PostListCard item={item} origin={'Comm'} />;
    // }
  };

  const renderItemSeparatorComponent = () => <AndroidDivider needMarginHorizontal needMarginVertical />;
  const renderEmptyResult = () => <FlatListEmptyResults type={`아직 게시물이`} />;

  return (
    <FlatList
      data={data.listPostsByType.items}
      keyExtractor={_keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.flatListContainer}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      ListEmptyComponent={renderEmptyResult}
      ListFooterComponent={
        <FlatListFooter loading={loading || networkStatus === 4} eolMessage="게시물 리스트의 끝" isEmpty={data.listPostsByType.items.length === 0} />
      }
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
      onEndReached={_handleFetchMore}
      onEndReachedThreshold={5}
      // removeClippedSubviews={true}
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

export default withNavigationFocus(PostList);
// memo(PostList, isEqual);
