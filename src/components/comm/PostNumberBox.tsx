import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PostNumbers } from '../../types/store';
import isEqual from 'react-fast-compare';
import { useStoreState } from '../../stores/initStore';

interface Props {
  postNumbers: PostNumbers;
  fromHome?: boolean;
}

const PostNumberBox = ({ postNumbers, fromHome }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const { numOfComments, numOfLikes } = postNumbers;

  const fromHomeFontSize = { fontSize: theme.fontSize.error };

  return (
    <View style={styles.numberInfoRow}>
      <Icon
        name="comment-multiple-outline"
        style={[styles.cardInfoIcon, fromHome && fromHomeFontSize, { color: getThemeColor('placeholder', appearance) }]}
      />
      <Text
        style={[
          styles.cardInfoText,
          styles.marginRight,
          fromHome && fromHomeFontSize,
          { color: getThemeColor('backdrop', appearance) },
        ]}
      >
        {numOfComments}
      </Text>
      <Icon
        name="thumb-up-outline"
        style={[styles.cardInfoIcon, fromHome && fromHomeFontSize, { color: getThemeColor('placeholder', appearance) }]}
      />
      <Text
        style={[styles.cardInfoText, fromHome && fromHomeFontSize, { color: getThemeColor('backdrop', appearance) }]}
      >
        {numOfLikes}
      </Text>
      {/* <Icon name="thumbs-o-down" style={styles.cardInfoIcon} />
      <Text style={[styles.cardInfoText, styles.marginRight]}>{numOfDislikes}</Text> */}
      {/* <Icon name="search" style={styles.cardInfoIcon} />
      <Text style={styles.cardInfoText}>{numOfViews}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  numberInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: theme.size.small,
  },

  cardInfoText: {
    fontSize: theme.fontSize.small,
  },

  cardInfoIcon: {
    fontSize: theme.fontSize.small,
    marginRight: theme.fontSize.xs,
  },
  marginRight: {
    marginRight: theme.fontSize.error,
  },
});

export default memo(PostNumberBox, isEqual);
