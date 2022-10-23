import { StyleSheet, View } from 'react-native';

import MyHeadline from '../MyHeadline';
import React from 'react';
import theme from '../../configs/theme';

const ChatNavBar = () => {
  return (
    <View style={styles.container}>
      <MyHeadline>채팅</MyHeadline>
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
});

export default ChatNavBar;
