import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import theme, { lightColors } from '../configs/theme';

const StopServiceScreen = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: lightColors.logoBG,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{ color: 'white', fontWeight: 'bold', fontSize: theme.fontSize.medium, marginBottom: theme.size.normal }}
      >
        코로나19로 인해 서비스를 일시 정지합니다
      </Text>
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: theme.fontSize.medium }}>
        그 동안 이용해 주셔서 감사합니다
      </Text>
    </SafeAreaView>
  );
};

export default StopServiceScreen;
