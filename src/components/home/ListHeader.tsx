import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import { AppearanceType } from '../../types/store';
import { HOMEPAGE_URL } from '../../configs/variables';
import MySubHeadline from '../MySubHeadline';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useStoreState } from '../../stores/initStore';
import { PostCategory } from '../../API';

interface Props extends NavigationInjectedProps {
  title: string;
  category: string;
  postCategory?: PostCategory;
}

const ListHeader = ({ title, category, postCategory, navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  const _handleURL = useCallback(() => {
    const url = `${HOMEPAGE_URL}category/${category}`;
    navigation.push('WebView', { url, title });
  }, [category, title]);

  const _handlePostURL = useCallback(() => {
    navigation.navigate('Comm', { postCategory });
  }, [postCategory]);

  return (
    <View style={styles.headerContainer}>
      <MySubHeadline>{title}</MySubHeadline>
      {category !== 'post' ? (
        <TouchableOpacity onPress={_handleURL}>
          <Text style={styles.buttonText}>전체 보기</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={_handlePostURL}>
          <Text style={styles.buttonText}>더보기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 },
    buttonText: { color: getThemeColor('primary', appearance), fontWeight: 'normal', fontSize: theme.fontSize.medium },
  });

export default memo(withNavigation(ListHeader));
