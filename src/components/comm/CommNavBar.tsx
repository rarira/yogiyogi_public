import { StyleSheet, View } from 'react-native';

import MyHeadline from '../MyHeadline';
import { PostCategory } from '../../API';
import PostCategoryQueryMenu from './PostCategoryQueryMenu';
import React from 'react';
import theme from '../../configs/theme';

interface Props {
  setQueryCategory: (arg: PostCategory | null) => void;
  queryCategory: PostCategory | null;
}

const CommNavBar = ({ queryCategory, setQueryCategory }: Props) => {
  return (
    <View style={styles.container}>
      <MyHeadline>게시판</MyHeadline>
      <View style={styles.buttonContainer}>
        <PostCategoryQueryMenu queryCategory={queryCategory} setQueryCategory={setQueryCategory} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: theme.size.big,
    marginTop: theme.size.small,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default CommNavBar;
