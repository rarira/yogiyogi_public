import { StyleSheet, Text, View } from 'react-native';
import theme, { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import React from 'react';
import { useStoreState } from '../stores/initStore';

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      marginTop: theme.size.big,
      paddingHorizontal: theme.size.small,
      // backgroundColor: getThemeColor('background', appearance),
    },
    example: { color: getThemeColor('accent', appearance), fontSize: theme.fontSize.small, marginBottom: 6 },
    title: { color: getThemeColor('placeholder', appearance), marginBottom: 10 },
    category: { color: getThemeColor('text', appearance), marginBottom: 6, fontWeight: 'bold' },
  });

const AddressSearchGuide = () => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const styles = getThemedStyles(appearance);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>아래와 같은 조합으로 검색하세요</Text>
      <Text style={styles.category}>도로명 + 건물번호</Text>
      <Text style={styles.example}>예: 판교역로 235, 제주 첨단로 242</Text>
      <Text style={styles.category}>지역명(동/리) + 번지</Text>
      <Text style={styles.example}>예: 삼평동 681, 제주 영평동 2181</Text>
    </View>
  );
};

export default AddressSearchGuide;
