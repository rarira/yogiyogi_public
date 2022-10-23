import { Alert } from 'react-native';
import { BackHandler } from 'react-native';

const exitAlert = () => {
  Alert.alert('앱 종료 확인', '앱을 종료하시겠습니까?', [
    { text: '취소', style: 'cancel' },
    {
      text: '종료',
      onPress: () => {
        BackHandler.exitApp();
      },
    },
  ]);
};

export default exitAlert;
