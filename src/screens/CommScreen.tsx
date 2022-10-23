import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { useEffect, useReducer, useState } from 'react';

import CommNavBar from '../components/comm/CommNavBar';
import { SafeAreaView as NativeSafeAreaView } from 'react-native';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import { PostCategory } from '../API';
import PostList from '../components/comm/PostList';
import PostListByCategory from '../components/comm/PostListByCategory';
import { SafeAreaView } from 'react-navigation';
import StatusBarNormal from '../components/StatusBarNormal';
import { getStyles } from '../configs/styles';
import { useStoreState } from '../stores/initStore';

// import useHandleAndroidBack from '../functions/handleAndroidBack';

interface Props extends NavigationStackScreenProps {
  isFocused: boolean;
}

const CommScreen = ({ navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getStyles(appearance);

  const postCategory = navigation.getParam('postCategory');

  const [queryCategory, setQueryCategory] = useState<PostCategory | null>(postCategory ?? null);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setQueryCategory(postCategory);
    }
    return () => {
      mounted = false;
    };
  }, [postCategory]);

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={appearance} />
      <CommNavBar queryCategory={queryCategory} setQueryCategory={setQueryCategory} />

      <NativeSafeAreaView style={styles.contentContainerView}>
        {!queryCategory ? (
          <PostList snackbarDispatch={snackbarDispatch} />
        ) : (
          <PostListByCategory snackbarDispatch={snackbarDispatch} queryCategory={queryCategory} />
        )}
      </NativeSafeAreaView>
      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
    </SafeAreaView>
  );
};

export default CommScreen;
