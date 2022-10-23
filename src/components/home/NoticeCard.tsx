import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import { HOMEPAGE_URL } from '../../configs/variables';
import { NavigationInjectedProps } from 'react-navigation';
import { NewsData } from '../../types/store';
import { useStoreState } from '../../stores/initStore';
import { withNavigation } from 'react-navigation';

interface Props extends NavigationInjectedProps {
  data: NewsData;
}

const NoticeCard = ({ data, navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const { createdAt, newsURL, newsTitle } = data;

  const _handleURL = () => {
    const url = `${HOMEPAGE_URL}${newsURL}`;
    navigation.push('WebView', { url, title: newsTitle });
  };

  const createdAtString = useMemo(() => createdAt.split('T')[0], [createdAt]);

  return (
    <TouchableOpacity onPress={_handleURL} style={styles.container}>
      <View style={styles.title}>
        <Text
          style={[styles.titleText, { color: getThemeColor('placeholder', appearance) }]}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {newsTitle}
        </Text>
      </View>
      <Text style={{ color: getThemeColor('text', appearance) }}>{createdAtString}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: theme.size.normal,
    flex: 1,
    // marginHorizontal: theme.size.small,
  },
  titleText: {
    fontSize: theme.fontSize.normal,
    fontWeight: '600',
    // marginLeft: theme.size.small,
    flex: 1,
  },

  title: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    paddingRight: theme.size.normal,
  },
});

export default memo(withNavigation(NoticeCard));
