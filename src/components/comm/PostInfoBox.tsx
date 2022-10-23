import { AppearanceType, PostNumbers } from '../../types/store';
import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostNumberBox from './PostNumberBox';
import getTagString from '../../functions/getTagString';
import getYearMonthDate from '../../functions/getYearMonthDate';
import isEqual from 'react-fast-compare';
import { useStoreState } from '../../stores/initStore';

interface Props {
  date: string | Date;
  postTitle: string;
  postNumbers: PostNumbers;
  postTags?: string;
}

const PostInfoBox = ({ date, postTitle, postNumbers, postTags }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  const dateString = useMemo(() => getYearMonthDate(date), [date]);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{postTitle}</Text>
      {!!postTags && (
        <Text style={styles.cardInfoText}>
          <Icon name="tag-multiple" color={theme.colors.text} /> {getTagString(postTags)}
        </Text>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.cardInfoText}>{dateString}</Text>
        {!!postNumbers && <PostNumberBox postNumbers={postNumbers} />}
      </View>
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      // flex: 1,
      paddingVertical: theme.size.normal,
      marginHorizontal: theme.size.big,
      paddingBottom: theme.size.normal,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      // borderColor: 'red',
      // borderColor: theme.colors.backdrop,
      // borderBottomWidth: StyleSheet.hairlineWidth,
    },
    infoContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardInfoText: {
      color: getThemeColor('backdrop', appearance),
      fontSize: theme.fontSize.small,
      marginTop: theme.size.xs,
    },
    titleText: {
      color: getThemeColor('text', appearance),
      fontSize: theme.fontSize.normal,
      fontWeight: '600',
    },
  });

export default memo(PostInfoBox, isEqual);
