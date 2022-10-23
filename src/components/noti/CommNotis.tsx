import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { Platform, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import React, { memo, useEffect, useState } from 'react';

import CommNotiCard from './CommNotiCard';
import { CommentData } from '../../types/store';
import FlatListEmptyResults from '../FlatListEmptyResults';
import Loading from '../Loading';
import addDays from 'date-fns/add_days';
import addMonths from 'date-fns/add_months';
import { customListCommentsByReceiver } from '../../customGraphqls';
import gql from 'graphql-tag';
import isSameDay from 'date-fns/is_same_day';
import isSameMonth from 'date-fns/is_same_month';
import isSameWeek from 'date-fns/is_same_week';
import parse from 'date-fns/parse';
import reportSentry from '../../functions/reportSentry';
import sort from 'js-flock/sort';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';
import { getTheme } from '../../configs/theme';
import { ref } from 'yup';

interface Props {
  userId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  isFocused: boolean;
}

export interface NotiSection {
  title: string;
  data: CommentData[];
}

const LIST_COMMENTS_BY_RECEIVER = gql(customListCommentsByReceiver);

const now = new Date();
// const nowISOString = now.toISOString();
const twoMonthBeforeISOString = addMonths(now, -2).toISOString();

const CommNotis = ({ userId, snackbarDispatch, isFocused }: Props) => {
  const {
    authStore: { appState, appearance },
  } = useStoreState();
  const [refreshing, setRefreshing] = useState(false);

  const queryInput = {
    commentReceiverId: userId,
    commentNotiStatusCreatedAt: {
      ge: { commentNotiStatus: 'OPEN', createdAt: twoMonthBeforeISOString },
    },
    // TODO: prod don't need this line
    // createdAt: { ge: '2020-02-27' },
    limit: 50,
    filter: { commentAuthorId: { ne: userId } },
    sortDirection: 'DESC',
  };
  const { data, refetch, error, fetchMore, networkStatus } = useQuery(LIST_COMMENTS_BY_RECEIVER, {
    variables: queryInput,
    fetchPolicy: 'network-only',
    // skip: !isFocused,
    notifyOnNetworkStatusChange: true,
  });

  const _handleOnRefresh = async () => {
    try {
      await refetch();
    } catch (e) {
      reportSentry(e);
    }
  };

  const [notis, setNotis] = useState<CommentData[] | null>(null);
  const [sections, setSections] = useState<NotiSection[] | null>(null);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && data?.listCommentsByReceiver) {
      const temp: CommentData[] = data?.listCommentsByReceiver?.items
        ? sort(data.listCommentsByReceiver.items).desc((item: CommentData) => {
            return item.createdAt;
          })
        : [];
      setNotis(temp);
    }
    return () => {
      _mounted = false;
    };
  }, [data]);

  useEffect(() => {
    let _mounted = true;
    const _sectionize = (data: any[]) => {
      const today = new Date();
      const yesterDay = addDays(today, -1);
      // const lastMonth = addMonths(today, -1);

      const notisToday: any[] = [];
      const notisYesterday: any[] = [];
      const notisWeek: any[] = [];
      const notisMonth: any[] = [];
      const notisLastMonth: any[] = [];

      // if there is notilist, sectionize
      if (data && data.length > 0) {
        data.forEach((element: CommentData) => {
          const { createdAt } = element;
          const createdDate = parse(createdAt);

          if (isSameDay(createdDate, today)) {
            notisToday.push(element);
          } else if (isSameDay(createdDate, yesterDay)) {
            notisYesterday.push(element);
          } else if (isSameWeek(createdDate, today, { weekStartsOn: 1 })) {
            notisWeek.push(element);
          } else if (isSameMonth(createdDate, today)) {
            notisMonth.push(element);
          } else {
            notisLastMonth.push(element);
          }
        });

        return [
          { title: '오늘', data: notisToday },
          { title: '어제', data: notisYesterday },
          { title: '이번 주', data: notisWeek },
          { title: '이번 달', data: notisMonth },
          { title: '지난 달 이전 (최대 2개월 이전)', data: notisLastMonth },
        ];
      }
      return [];
    };

    if (_mounted && notis !== null) {
      if (notis.length === 0) {
        setSections([]);
      } else {
        const temp = _sectionize(notis);
        setSections(temp);
      }
    }
    return () => {
      _mounted = false;
    };
  }, [notis]);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && isFocused && appState === 'active') {
      _handleOnRefresh();
    }
    return () => {
      _mounted = false;
    };
  }, [isFocused, appState]);

  const _keyExtractor = (item: CommentData) => {
    // console.log(idx, ':', item);
    return item.id;
  };

  // console.log(data, error, sections);

  const _handleOnEndReached = () => {
    if (data.listCommentsByReceiver.nextToken) {
      fetchMore({
        variables: { nextToken: data.listCommentsByReceiver.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) return prev;

          return Object.assign({}, prev, {
            listCommentsByReceiver: {
              items: [...prev.listCommentsByReceiver.items, ...fetchMoreResult.listCommentsByReceiver.items],
              nextToken: fetchMoreResult.listCommentsByReceiver.nextToken,
              __typename: prev.listCommentsByReceiver.__typename,
            },
          });
        },
      });
    }
  };

  if (!data || !data.listCommentsByReceiver || sections === null) {
    return <Loading origin="CommNotis" />;
  }

  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
  }

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const renderItem = ({ item }: { item: CommentData }) => {
    return (
      <View style={styles.itemContainer}>
        <CommNotiCard noti={item} snackbarDispatch={snackbarDispatch} queryInput={queryInput} />
      </View>
    );
  };

  const renderSectionHeader = ({ section: { data, title } }: any) => {
    if (data.length > 0) {
      return (
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderTitle}>{title}</Text>
        </View>
      );
    }
    return null;
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
  return (
    <SectionList
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      sections={sections}
      keyExtractor={_keyExtractor}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
      ListEmptyComponent={<FlatListEmptyResults type="확인할 게시판 알림이" />}
      initialNumToRender={20}
      stickySectionHeadersEnabled
      renderSectionHeader={renderSectionHeader}
      // alwaysBounceVertical={false}
      // removeClippedSubviews
      contentContainerStyle={styles.flatListContainer}
      onEndReached={_handleOnEndReached}
      onEndReachedThreshold={2}
      style={styles.container}
    />
  );
};
const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: theme.size.big,
      marginVertical: theme.size.medium,
      // borderColor: 'red',
      // borderWidth: 1,
    },
    itemContainer: { backgroundColor: theme.colors.background },
    sectionHeaderContainer: { backgroundColor: theme.colors.background, paddingVertical: theme.size.small },
    flatListContainer: {
      backgroundColor: theme.colors.background,
    },
    sectionHeaderTitle: { fontWeight: '600', fontSize: theme.fontSize.normal, color: theme.colors.text },
    bannerContainer: { marginVertical: theme.size.big },
  });

export default memo(CommNotis);
