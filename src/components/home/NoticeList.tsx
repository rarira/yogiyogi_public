import { FlatList, StyleSheet, View } from 'react-native';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';

import ListHeader from './ListHeader';
import { NewsData } from '../../types/store';
import NoticeCard from './NoticeCard';
import theme from '../../configs/theme';
import reportSentry from '../../functions/reportSentry';

interface Props extends NavigationInjectedProps {
  data: unknown;
  error: unknown;
}

const NoticeList = ({ data, error }: Props) => {
  if (!data || !data.listNewsByType) {
    return null;
  }
  if (error) {
    reportSentry(error);
    // snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const renderItem = ({ item }: { item: NewsData }) => {
    return <NoticeCard data={item} />;
  };

  const _keyExtractor = (item: NewsData) => item.id;

  return (
    <View style={styles.container}>
      <ListHeader title="공지사항" category="notice" />
      <FlatList
        data={data.listNewsByType.items}
        renderItem={renderItem}
        keyExtractor={_keyExtractor}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    // backgroundColor: theme.colors.background,
    marginTop: theme.size.big,
    marginBottom: theme.size.big,
    marginHorizontal: theme.size.big,
  },
  listContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    // backgroundColor: theme.colors.background,
  },
});

export default memo(withNavigation(NoticeList));
