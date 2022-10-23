import { ApolloQueryResult, NetworkStatus } from 'apollo-client';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import React, { memo, useEffect } from 'react';

import AD_IDS from '../../static/data/AD_IDS';
import ChatListCard from './ChatListCard';
import { DocumentNode } from 'apollo-link';
import FlatListEmptyResults from '../FlatListEmptyResults';
import Loading from '../Loading';
import MyBannerAd from '../Ad/MyBannerAd';
import { MySnackbarAction } from '../MySnackbar';
import { OperationVariables } from '@apollo/react-common';
import { SearchConvItem } from '../../types/apiResults';
import { WarningProps } from '../WarningDialog';
import reportSentry from '../../functions/reportSentry';

import { useStoreState } from '../../stores/initStore';
import { getTheme } from '../../configs/theme';
import { useState } from 'react';

interface Props {
  data: any;
  refetch: any;
  initialNumToRender: number;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  fetchMore: ({
    query,
    variables,
    updateQuery,
  }: {
    query?: DocumentNode;
    variables?: OperationVariables;
    updateQuery: any;
  }) => Promise<ApolloQueryResult<SearchConvItem[]>>;
  subscribeToMore: any;
  subscribeToNewConv1?: any;
  subscribeToNewConv2?: any;
  subscribeToNewConv3?: any;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  type: string;
  // networkStatus: NetworkStatus;
}

const ChatList = ({
  data,
  refetch,
  initialNumToRender,
  snackbarDispatch,
  fetchMore,
  subscribeToMore,
  subscribeToNewConv1,
  subscribeToNewConv2,
  subscribeToNewConv3,
  setWarningProps,
  type,
}: // networkStatus,
Props) => {
  const {
    authStore: { appState, isInternetReachable, appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const [refreshing, setRefreshing] = useState(false);

  const chatRooms: SearchConvItem[] = data.searchConvs ? data.searchConvs.items : [];

  useEffect(() => {
    if (appState === 'active' && isInternetReachable) {
      if (subscribeToNewConv1) {
        subscribeToNewConv1();
      }
      if (subscribeToNewConv2) {
        subscribeToNewConv2();
      }
      if (subscribeToNewConv3) {
        subscribeToNewConv3();
      }
    }
  }, [appState, isInternetReachable]);

  const _keyExtractor = (item: SearchConvItem) => {
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
          if (fetchMoreResult.searchConvs.nextToken === prev.searchConvs.nextToken) return prev;

          return {
            searchConvs: {
              items: [...prev.searchConvs.items, ...fetchMoreResult.searchConvs.items],
              nextToken: fetchMoreResult.searchConvs.nextToken,
              __typename: prev.searchConvs.__typename,
            },
          };
        },
      });
    }
  };

  const renderItem = ({ item }: { item: SearchConvItem }) => {
    return (
      <ChatListCard
        chat={item}
        snackbarDispatch={snackbarDispatch}
        subscribeToMore={subscribeToMore}
        setWarningProps={setWarningProps}
        type={type}
        classId={item.onClass.id}
      />
    );
  };

  if (!data || !data.searchConvs) {
    return <Loading origin="ChatList" />;
  }

  // const renderFooter = () => {
  //   if (networkStatus === 4) {
  //     return (
  //       <View style={styles.bannerContainer}>
  //         <Loading size="small" />
  //       </View>
  //     );
  //   } else return null;
  // };

  return (
    <>
      <FlatList
        data={chatRooms}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyExtractor={_keyExtractor}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={_handleRefreshControl}
        ListEmptyComponent={<FlatListEmptyResults type="진행 중인 채팅이" />}
        // ListFooterComponent={renderFooter}
        initialNumToRender={initialNumToRender}
        // scrollEnabled
        contentContainerStyle={styles.contentContainer}
        onEndReached={_handleFetchMore}
        onEndReachedThreshold={2}
      />
      <View style={styles.bannerContainer}>
        <MyBannerAd advId={AD_IDS.ChatListBanner} />
      </View>
    </>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    contentContainer: { backgroundColor: theme.colors.background, paddingBottom: theme.size.big },
    bannerContainer: { marginVertical: theme.size.big },
  });
export default memo(ChatList);
