import * as Animatable from 'react-native-animatable';

import { FlatList, StyleSheet, View } from 'react-native';
import React, { memo } from 'react';

import EventBanner from './EventBanner';
import ListHeader from './ListHeader';
import { NewsData } from '../../types/store';
import theme from '../../configs/theme';
import reportSentry from '../../functions/reportSentry';
import Loading from '../Loading';

interface Props {
  data: unknown;
  error: unknown;
}

const EventList = ({ data, error }: Props) => {
  if (!data || !data.listNewsByType) {
    return null;
  }

  if (error || data.listNewsByType.items.length === 0) {
    reportSentry(error);
    // snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const renderItem = ({ item }: { item: NewsData }) => {
    return <EventBanner data={item} />;
  };

  const _keyExtractor = (item: NewsData) => item.id;

  return (
    <Animatable.View style={styles.container} useNativeDriver animation="flipInX">
      <ListHeader title="진행 중인 이벤트" category="events" />
      <FlatList
        data={data.listNewsByType.items}
        renderItem={renderItem}
        keyExtractor={_keyExtractor}
        contentContainerStyle={styles.listContainer}
      />
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    // backgroundColor: theme.colors.background,
    marginTop: theme.size.small,
    marginBottom: theme.size.big,
    marginHorizontal: theme.size.big,
  },
  listContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    // backgroundColor: theme.colors.background,
  },
});

export default memo(EventList);
