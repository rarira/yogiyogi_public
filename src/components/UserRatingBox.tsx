import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme, { getThemeColor } from '../configs/theme';

import Icon from 'react-native-vector-icons/Ionicons';
import { Ratings } from '../types/apiResults';
import getRatings from '../functions/getRatings';
import { useStoreState } from '../stores/initStore';

interface Props {
  ratings: Ratings;
}

const UserRatingBox = ({ ratings }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const { totalRating } = useMemo(() => getRatings(ratings), [ratings]);
  const color = getThemeColor('indigo700', appearance);

  return (
    <View style={styles.container}>
      <Icon name="ios-calculator" color={color} size={theme.fontSize.normal} />
      <Text style={[styles.scoreText, { color }]}>{totalRating} 점</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: theme.fontSize.medium,
    fontWeight: '500',
    marginLeft: theme.size.small,
  },
});
export default memo(UserRatingBox);
