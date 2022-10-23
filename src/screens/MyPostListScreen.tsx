import { FlatList, RefreshControl, SafeAreaView } from 'react-native';
import MySnackbar, { OPEN_SNACKBAR, snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { useMemo, useReducer, useState } from 'react';

import AndroidDivider from '../components/AndroidDivider';
import BackButton from '../components/BackButton';
import Body from '../components/Body';
import FlatListEmptyResults from '../components/FlatListEmptyResults';
import FlatListFooter from '../components/FlatListFooter';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import Loading from '../components/Loading';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import { PostData } from '../types/store';
import PostListCard from '../components/comm/PostListCard';
import Right from '../components/Right';
import SortButton from '../components/ClassList/SortButton';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { customListPostsByAuthor } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';
import { ModelSortDirection } from '../API';

interface Props extends NavigationStackScreenProps {}

const LIST_MY_POST = gql(customListPostsByAuthor);

const MyPostListScreen = ({ navigation }: Props) => {
  const [sort, setSort] = useState<ModelSortDirection>(ModelSortDirection.DESC);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [refreshing, setRefreshing] = useState(false);

  // const isFocused = navigation.isFocused();

  const {
    authStore: { user, appearance },
  } = useStoreState();
  const styles = getStyles(appearance);
  const variables = { postAuthorId: user?.username ?? '', limit: 30, sortDirection: sort.toUpperCase() };
  const { loading, data, error, refetch, networkStatus, fetchMore } = useQuery(LIST_MY_POST, {
    variables,
    fetchPolicy: 'cache-and-network',
    // skip: bookmarkedClassIdList.length === 0,
  });

  const _handleBackButton = () => {
    navigation.goBack();
  };

  useHandleAndroidBack(navigation, _handleBackButton);

  const renderHeader = useMemo(() => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body flex={5}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>등록한 게시물 리스트</HeaderTitle>
        </Body>
        <Right>
          <SortButton sort={sort} setSort={setSort} />
        </Right>
      </SwitchStackHeader>
    );
  }, [sort, appearance]);

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

  if (!data || !data.listPostsByAuthor) {
    return <Loading origin="PostList" />;
  }
  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const _keyExtractor = (item: PostData) => item.id;

  const _handleFetchMore = () => {
    if (data.listPostsByAuthor.nextToken) {
      fetchMore({
        variables: { nextToken: data.listPostsByAuthor.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) return prev;

          if (fetchMoreResult.listPostsByAuthor.nextToken === prev.listPostsByAuthor.nextToken) {
            return prev;
          }
          return {
            listPostsByAuthor: {
              items: [...prev.listPostsByAuthor.items, ...fetchMoreResult.listPostsByAuthor.items],
              nextToken: fetchMoreResult.listPostsByAuthor.nextToken,
              __typename: prev.listPostsByAuthor.__typename,
            },
          };
        },
      });
    }
  };

  if (data.listPostsByAuthor.nextToken && data.listPostsByAuthor.items.length < 2) {
    _handleFetchMore();
  }

  const renderItem = ({ item }: { item: PostData }) => {
    // if (!item.blockedBy || !item.blockedBy.includes(user.username)) {
    return <PostListCard item={item} origin={'MyPostList'} />;
    // }
  };

  const renderItemSeparatorComponent = () => <AndroidDivider needMarginHorizontal needMarginVertical />;
  const renderEmptyResult = () => <FlatListEmptyResults type={`아직 등록한 게시물이`} />;

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={appearance} />
      {renderHeader}
      <FlatList
        data={data.listPostsByAuthor.items}
        keyExtractor={_keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.postFlatListContainer}
        ItemSeparatorComponent={renderItemSeparatorComponent}
        ListEmptyComponent={renderEmptyResult}
        ListFooterComponent={
          <FlatListFooter
            loading={loading || networkStatus === 4}
            eolMessage="나의 게시물 리스트의 끝"
            isEmpty={data.listPostsByAuthor.items.length === 0}
          />
        }
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
        onEndReached={_handleFetchMore}
        onEndReachedThreshold={5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
      />
      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
    </SafeAreaView>
  );
};

export default MyPostListScreen;
