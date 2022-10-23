import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import MyChip from '../MyChip';
import theme from '../../configs/theme';

const ClassViewTags = ({ tags }: { tags: string | null | undefined }) => {
  const tagArray = tags ? tags.split(',') : null;

  if (!tagArray) return null;

  return (
    <View style={styles.container}>
      {tagArray && tagArray.map(tag => <MyChip name={tag} key={tag} isClassViewScreen />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.size.small,
    marginHorizontal: theme.size.big,
  },
});
export default memo(ClassViewTags);
