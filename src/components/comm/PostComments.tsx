import { FlatList, RefreshControl, StyleSheet, TextInput } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationFocusInjectedProps, withNavigationFocus } from 'react-navigation';
import React, { Ref, useEffect, useState } from 'react';
import { customListCommentsByAddedTo, customOnCreatePostComment } from '../../customGraphqls';
import { useQuery, useSubscription } from '@apollo/react-hooks';

import AndroidDivider from '../AndroidDivider';
import CommentCard from './CommentCard';
import { CommentData } from '../../types/store';
import { CommentStatus } from '../../API';
import FlatListEmptyResults from '../FlatListEmptyResults';
import FlatListFooter from '../FlatListFooter';
import Loading from '../Loading';
import { WarningProps } from '../WarningDialog';
import gql from 'graphql-tag';
import guestClient from '../../configs/guestClient';
import produce from 'immer';
import reportSentry from '../../functions/reportSentry';
import theme from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationFocusInjectedProps {
  addedToId?: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  keyboardHeight?: number;
  setWarningProps?: (arg: Partial<WarningProps> | null) => void;
  textInputEl?: Ref<TextInput>;
  postTitle?: string;
}

const LIST_COMMENTS_OF_POST = gql(customListCommentsByAddedTo);
const SUBSCRIBE_TO_COMMENT_CREATE = gql(customOnCreatePostComment);

const PostComments = ({ addedToId, isFocused, snackbarDispatch, keyboardHeight, setWarningProps, textInputEl, postTitle }: Props) => {
  const {
    authStore: { user, appState },
    commentStore: { postId, postTitle: storePostTitle },
  } = useStoreState();
  const [refreshing, setRefreshing] = useState(false);

  const queryId = !!addedToId ? addedToId : postId;
  const postTitleToPass = postTitle ?? storePostTitle;

  const variables = {
    addedToId: queryId,
    sortDirection: 'ASC',
    limit: 20,
    filter: { not: { and: [{ commentStatus: { eq: CommentStatus.DELETED } }, { numOfSub: { eq: 0 } }] } },
  };

  const { loading, error, data, fetchMore, refetch, networkStatus } = useQuery(LIST_COMMENTS_OF_POST, {
    variables,
    // skip: !queryId,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    ...(!user && { client: guestClient }),
  });

  const _handleRefetch = async () => {
    try {
      await refetch();
    } catch (e) {
      reportSentry(e);
    }
  };

  const subs = useSubscription(SUBSCRIBE_TO_COMMENT_CREATE, {
    variables: { addedToId: queryId },
    // skip: !queryId,
    ...(!user && { client: guestClient }),
    onSubscriptionData: options => {
      try {
        const { onCreatePostComment } = options.subscriptionData.data;
        const queryResult: any = options.client.readQuery({
          query: LIST_COMMENTS_OF_POST,
          variables,
        });

        const { items, ...others } = queryResult.listCommentsByAddedTo;
        const length = items.length;
        if (!items[length - 1] || items[length - 1].id !== onCreatePostComment.id) {
          // console.log('subscription data fetches new message: ', onCreatePostComment);

          const nextItems = produce(items, (draft: any) => {
            draft.concat([onCreatePostComment]);
          });

          const newData = { listCommentsByAddedTo: { items: nextItems, ...others } };
          options.client.writeQuery({ query: LIST_COMMENTS_OF_POST, variables, data: newData });
        }
      } catch (e) {
        reportSentry(e);
      }
    },
  });

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

  if (!data || !data.listCommentsByAddedTo) {
    return <Loading origin={`PostComments_${postId}`} />;
  }
  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const _keyExtractor = (item: CommentData) => item.id;

  const _handleFetchMore = () => {
    if (data.listCommentsByAddedTo.nextToken) {
      fetchMore({
        variables: { nextToken: data.listCommentsByAddedTo.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) return prev;

          if (fetchMoreResult.listCommentsByAddedTo.nextToken === prev.listCommentsByAddedTo.nextToken) {
            return prev;
          }
          return {
            listCommentsByAddedTo: {
              items: [...prev.listCommentsByAddedTo.items, ...fetchMoreResult.listCommentsByAddedTo.items],
              nextToken: fetchMoreResult.listCommentsByAddedTo.nextToken,
              __typename: prev.listCommentsByAddedTo.__typename,
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

  if (data.listCommentsByAddedTo.nextToken && data.listCommentsByAddedTo.items.length < 2) {
    _handleFetchMore();
  }

  const renderItem = ({ item }: { item: CommentData }) => {
    return (
      <CommentCard
        commentItem={item}
        snackbarDispatch={snackbarDispatch}
        setWarningProps={setWarningProps}
        textInputEl={textInputEl}
        // keyboardHeight={keyboardHeight}
        postTitle={postTitleToPass}
      />
    );
  };

  const renderEmptyResult = () => {
    if (!(data.listCommentsByAddedTo.nextToken && data.listCommentsByAddedTo.items.length < 2)) {
      return <FlatListEmptyResults type={'아직 댓글이'} />;
    }
    return null;
  };
  const renderItemSeparatorComponent = () => <AndroidDivider needMarginVertical color={'transparent'} />;

  return (
    <FlatList
      data={data.listCommentsByAddedTo.items}
      keyExtractor={_keyExtractor}
      renderItem={renderItem}
      initialNumToRender={20}
      // style={styles.container}
      contentContainerStyle={[styles.contentsContainer, { paddingBottom: theme.size.big + (keyboardHeight ?? 0) }]}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      ListEmptyComponent={renderEmptyResult}
      ListFooterComponent={
        <FlatListFooter
          loading={loading || networkStatus === 4}
          eolMessage="댓글 리스트의 끝"
          isEmpty={data.listCommentsByAddedTo.items.length === 0}
        />
      }
      keyboardDismissMode="none"
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
      onEndReached={_handleFetchMore}
      onEndReachedThreshold={5}
      // removeClippedSubviews={true}
      scrollEnabled={true}
      maxToRenderPerBatch={20}
      // alwaysBounceVertical={false}
    />
  );
};

const styles = StyleSheet.create({
  // container: { marginBottom: 5 * theme.size.big },
  contentsContainer: {
    paddingVertical: theme.size.normal,
    // paddingBottom: 6 * theme.size.normal,

    marginHorizontal: theme.size.big,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default withNavigationFocus(PostComments);
