import { StyleSheet, View } from 'react-native';

import AuthButton from '../AuthButton';
import MyHeadline from '../MyHeadline';
import React from 'react';
import theme from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

const MyNavBar = () => {
  const {
    authStore: { user },
  } = useStoreState();

  return (
    <View style={styles.container}>
      <MyHeadline>마이 요기요기</MyHeadline>
      {!!user && (
        <View style={styles.buttonContainer}>
          <AuthButton origin="My" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: theme.size.big,
    marginVertical: theme.size.small,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default MyNavBar;
