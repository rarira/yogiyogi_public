import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import DeleteButton from '../DeleteButton';
import Icon from 'react-native-vector-icons/Ionicons';
import { SearchHistory } from '../../stores/ClassStore';
import format from 'date-fns/format';
import getTagString from '../../functions/getTagString';
import koLocale from 'date-fns/locale/ko';
import { removeSearchHistory } from '../../functions/manageSearchHistory';
import { getTheme } from '../../configs/theme';

interface Props {
  item: SearchHistory;
  index: number;
  dispatch: (arg: {}) => void;

  searchMode: string;
}
const numeral = require('numeral');

const SearchHistoryCard = ({ searchMode, item, index, dispatch }: Props) => {
  const { authStore } = useStoreState();

  const theme = getTheme(authStore.appearance);
  const styles = getThemedStyles(theme);

  const storeDispatch = useStoreDispatch();
  const type = searchMode === 'simple' ? 'simpleSearchHistory' : 'detailSearchHistory';
  const searchHistory = authStore[type];

  const _handleIcon = useCallback(
    () =>
      removeSearchHistory({
        historyItem: item,
        type,
        searchHistory,
        storeDispatch,
      }),
    [item, type, searchHistory, storeDispatch],
  );
  const _handleOnPress = () => {
    dispatch({
      type: 'queryHistory',
      isFirstHistoryItem: index === 0,
      classSort: item.classSort,
      ...(searchMode === 'simple' ? { keyword: item.keyword } : item.terms),
    });
  };

  const title = useMemo(() => {
    const classSortString = ` / ${item.classSort}`;
    if (searchMode === 'simple') return `${item.keyword}${classSortString}`;

    let string = '';

    Object.keys(item.terms!).forEach((key: string) => {
      if (item.terms![key]) {
        let newString = `${item.terms![key]}`;
        if (key === 'timeStartTerm') {
          newString = format(item.terms!.timeStartTerm!, 'A hh:mm', {
            locale: koLocale,
          });
        }
        if (key === 'feeTerm') {
          newString = `${numeral(item.terms!.feeTerm!).format('0,0')}원`;
        }
        if (key === 'regionTerm') {
          newString = getTagString(item.terms![key]);
        }
        if (key === 'tagTerm') {
          if (item.terms![key].length > 1) {
            newString = '[' + getTagString(item.terms![key].join(',')) + ']';
          }
        }
        if (string !== '' && newString !== '') {
          string = string.concat(',');
        }
        string = string.concat(newString);
      }
    });
    string = string.concat(classSortString);
    return string;
  }, [item, searchMode]);

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity onPress={_handleOnPress} style={styles.cardSubtitleRow}>
        <Text style={styles.cardSubtitleText}>
          <Icon name={'md-search'} size={theme.fontSize.normal} color={theme.colors.text} />
          {'  '}
          {title}
        </Text>
      </TouchableOpacity>

      <View style={styles.chatIcon}>
        <DeleteButton handleOnPress={_handleIcon} appearance={authStore.appearance} />
      </View>
    </View>
  );
};
const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    cardWrapper: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.size.medium,
    },

    cardSubtitleRow: {
      flex: 1,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginRight: theme.size.small,
      paddingVertical: 5,
    },
    cardSubtitleText: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      color: theme.colors.placeholder,
      fontSize: theme.fontSize.medium,
    },
    chatIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
      paddingRight: theme.size.normal,
    },
  });

export default memo(SearchHistoryCard);
