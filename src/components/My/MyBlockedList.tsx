import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import React, { memo } from 'react';

import FlatListEmptyResults from '../FlatListEmptyResults';
import FlatListFooter from '../FlatListFooter';
import Loading from '../Loading';
import MyBlockedClassCard from './MyBlockedClassCard';
import MyBlockedPostCard from './MyBlockedPostCard';
import MyBlockedUserCard from './MyBlockedUserCard';
import { MySnackbarAction } from '../MySnackbar';
import { NetworkStatus } from 'apollo-client';
import theme from '../../configs/theme';
import { AppearanceType } from '../../types/store';

export enum MyBlockedListTab {
  User = '사용자',
  Post = '게시물',
  Class = '클래스',
}
interface Props {
  data: string[];
  myId: string;
  tabLabel: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  networkStatus: NetworkStatus;
  updateQuery: any;
  handleOnRefresh: () => void;
  appearance: AppearanceType;
  refreshing: boolean;
}

const MyBlockedList = ({ data, myId, tabLabel, snackbarDispatch, networkStatus, updateQuery, handleOnRefresh, appearance, refreshing }: Props) => {
  if (networkStatus === 4) return <Loading origin="MyBlockedList" />;
  const _keyExtractor = (item: string) => item;

  // console.log(type, tabLabel, variables);

  const renderItem = ({ item }: { item: string }) => {
    switch (tabLabel) {
      case MyBlockedListTab.Class:
        return (
          <MyBlockedClassCard classId={item} snackbarDispatch={snackbarDispatch} myId={myId} updateQuery={updateQuery} appearance={appearance} />
        );

      case MyBlockedListTab.User:
        return <MyBlockedUserCard userId={item} snackbarDispatch={snackbarDispatch} myId={myId} updateQuery={updateQuery} appearance={appearance} />;
      case MyBlockedListTab.Post:
        return <MyBlockedPostCard postId={item} snackbarDispatch={snackbarDispatch} myId={myId} updateQuery={updateQuery} appearance={appearance} />;
      default:
        return null;
    }
  };

  const renderEmptyResult = () => {
    if (data.length === 0) {
      return <FlatListEmptyResults type={`차단한 ${tabLabel}${tabLabel === MyBlockedListTab.Post ? '이' : '가'}`} />;
    }
    return null;
  };

  return (
    <FlatList
      data={data}
      keyExtractor={_keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.flatListContainer}
      ListEmptyComponent={renderEmptyResult}
      ListFooterComponent={<FlatListFooter eolMessage={`차단한 ${tabLabel} 리스트의 끝`} isEmpty={data.length === 0} />}
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />}
      onEndReachedThreshold={2}
    />
  );
};

const styles = StyleSheet.create({
  flatListContainer: {
    // flex: 1,
    marginHorizontal: theme.size.big,
    paddingVertical: theme.size.big,
  },
});

export default memo(MyBlockedList);
