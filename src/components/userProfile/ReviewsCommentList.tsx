import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import React, { memo, useState } from 'react';

import AndroidDivider from '../AndroidDivider';
import FlatListEmptyResults from '../FlatListEmptyResults';
import FlatListFooter from '../FlatListFooter';
import HeadlineSub from '../HeadlineSub';
import Loading from '../Loading';
import MyDivider from '../MyDivider';
import { ReviewData } from '../../types/apiResults';
import ReviewsCommentCard from './ReviewsCommentCard';
import { customListReviewsByReviewee } from '../../customGraphqls';
import getEmptyReviewsResultType from '../../functions/getEmptyReviewsResultType';
import getReviewsListVariables from '../../functions/getReviewsListVariables';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import theme from '../../configs/theme';
import { useQuery } from '@apollo/react-hooks';
import { AppearanceType } from '../../types/store';

interface Props {
  type: string;
  userId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  privacySetting: boolean;
  userName: string;
  appearance: AppearanceType;
}

const LIST_REVIEWS_BY_REVIEWEE = gql(customListReviewsByReviewee);

const ReviewsCommentList = ({ type, userId, snackbarDispatch, privacySetting, userName, appearance }: Props) => {
  const variables = getReviewsListVariables(userId, type);
  const [refreshing, setRefreshing] = useState(false);

  const { loading, error, data, fetchMore, refetch } = useQuery(LIST_REVIEWS_BY_REVIEWEE, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
  const _keyExtractor = (item: ReviewData) => item.id;

  // * Production

  const queryName = 'listReviewsByReviewee';

  if (!data || !data.listReviewsByReviewee) {
    return <Loading origin="ReviewsCommentList" />;
  }
  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

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
    if (data.listReviewsByReviewee.nextToken) {
      fetchMore({
        variables: { nextToken: data.listReviewsByReviewee.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) return prev;
          if (fetchMoreResult.listReviewsByReviewee.nextToken === prev.listReviewsByReviewee.nextToken) {
            return prev;
          }
          return {
            listReviewsByReviewee: {
              items: [...prev.listReviewsByReviewee.items, ...fetchMoreResult.listReviewsByReviewee.items],
              nextToken: fetchMoreResult.listReviewsByReviewee.nextToken,
              __typename: prev.listReviewsByReviewee.__typename,
            },
          };
        },
      });
    }
  };

  if (data.listReviewsByReviewee.nextToken && data.listReviewsByReviewee.items.length < 2) {
    _handleFetchMore();
  }

  const renderItem = ({ item }: { item: ReviewData }) => {
    return <ReviewsCommentCard item={item} userId={userId} privacySetting={privacySetting} userName={userName} />;
  };

  const renderItemSeparatorComponent = () => <AndroidDivider needMarginVertical needMarginHorizontal />;

  const renderEmptyResult = () => {
    if (!(data.listReviewsByReviewee.nextToken && data.listReviewsByReviewee.items.length < 2)) {
      return <FlatListEmptyResults type={getEmptyReviewsResultType(type)} />;
    }
    return null;
  };

  const renderHeaderComponent = () => {
    if (type === 'allComments') return null;
    const text =
      type === 'hostComments'
        ? '호스트 활동에 대해 선생님들이 남겨 주신 코멘트 리스트입니다'
        : type === 'proxyComments'
        ? '선생님 활동에 대해 호스트들이 남겨 주신 코멘트 리스트입니다'
        : '타 사용자들이 사용자 리뷰로 남겨 주신 코멘트 리스트입니다';
    return (
      <View style={styles.headerContainer}>
        <HeadlineSub text={text} marginBottom={theme.size.small} />
        <MyDivider appearance={appearance} />
      </View>
    );
  };

  return (
    <FlatList
      data={data.listReviewsByReviewee.items}
      keyExtractor={_keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.flatListContainer}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      ListEmptyComponent={renderEmptyResult}
      ListFooterComponent={
        <FlatListFooter loading={loading} eolMessage="코멘트 리스트의 끝" isEmpty={data.listReviewsByReviewee.items.length === 0} />
      }
      ListHeaderComponent={renderHeaderComponent}
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
      onEndReached={_handleFetchMore}
      onEndReachedThreshold={2}
    />
  );
};

const styles = StyleSheet.create({
  flatListContainer: {
    flex: 1,
    // marginHorizontal: theme.size.big,
    // paddingVertical: theme.size.big,
  },
  headerContainer: {
    marginHorizontal: theme.size.big,
    marginBottom: theme.size.normal,
  },
});

export default memo(ReviewsCommentList);
