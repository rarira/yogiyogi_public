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
import FlatListFetchMoreFooter from '../FlatListFetchMoreFooter';
import Loading from '../Loading';
import { WarningProps } from '../WarningDialog';
import gql from 'graphql-tag';
import guestClient from '../../configs/guestClient';
import produce from 'immer';
import reportSentry from '../../functions/reportSentry';
import theme from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationFocusInjectedProps {
  addedToId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  keyboardHeight?: number;
  setWarningProps?: (arg: Partial<WarningProps> | null) => void;
  textInputEl?: Ref<TextInput>;
  origin: string;
  postTitle?: string;
}

const LIST_COMMENTS_OF_POST = gql(customListCommentsByAddedTo);
const SUBSCRIBE_TO_COMMENT_CREATE = gql(customOnCreatePostComment);

const PostCommentsByThread = ({ addedToId, isFocused, snackbarDispatch, keyboardHeight, setWarningProps, textInputEl, origin, postTitle }: Props) => {
  const {
    authStore: { user, appState, appearance },
    commentStore: { postTitle: storePostTitle },
  } = useStoreState();
  const [refreshing, setRefreshing] = useState(false);

  const postTitleToPass = postTitle ?? storePostTitle;

  const variables = {
    addedToId,
    sortDirection: 'ASC',
    limit: 30,
    filter: { not: { and: [{ commentStatus: { eq: CommentStatus.DELETED } }, { numOfSub: { eq: 0 } }] } },
  };
  const { loading, error, data, fetchMore, refetch, networkStatus } = useQuery(LIST_COMMENTS_OF_POST, {
    variables,
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
    variables: { addedToId },
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
      _handleRefetch();
    }

    return () => {
      _mounted = false;
      subs;
    };
  }, [isFocused, appState]);

  if (!data || !data.listCommentsByAddedTo) {
    return <Loading origin={`PostComments_${origin}_${addedToId}`} />;
  }
  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const _keyExtractor = (item: CommentData) => item.id;
  const isCommentView = origin === 'CommentView';

  const _handleFetchMore = () => {
    if (data.listCommentsByAddedTo.nextToken) {
      fetchMore({
        variables: { ...variables, nextToken: data.listCommentsByAddedTo.nextToken },
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
        postTitle={postTitleToPass}
      />
    );
  };

  const renderEmptyResult = () => {
    if (!(data.listCommentsByAddedTo.nextToken && data.listCommentsByAddedTo.items.length < 1)) {
      return <FlatListEmptyResults type={`아직 ${isCommentView ? '답글' : '댓글'}이`} />;
    }
    return null;
  };
  const renderItemSeparatorComponent = () => <AndroidDivider needMarginVertical color={'transparent'} />;
  const renderListFooterComponent = () => (
    <FlatListFetchMoreFooter
      loading={loading || networkStatus === 4}
      handleFetchMore={_handleFetchMore}
      nextToken={data.listCommentsByAddedTo.nextToken}
      appearance={appearance}
    />
  );
  return (
    <FlatList
      data={data.listCommentsByAddedTo.items}
      keyExtractor={_keyExtractor}
      renderItem={renderItem}
      initialNumToRender={10}
      contentContainerStyle={[styles.container, { paddingTop: theme.size.normal, paddingBottom: 40 + (keyboardHeight ?? 0) }]}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      ListEmptyComponent={renderEmptyResult}
      {...(!isCommentView && { ListFooterComponent: renderListFooterComponent })}
      // ListFooterComponent={renderListFooterComponent}
      keyboardDismissMode="none"
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
      {...(isCommentView && {
        onEndReached: _handleFetchMore,
        onEndReachedThreshold: 5,
      })}
      scrollEnabled={true}
      // alwaysBounceVertical={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2 * theme.size.normal,
    marginHorizontal: theme.size.big,
    paddingLeft: 2 * theme.size.medium,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default withNavigationFocus(PostCommentsByThread);
