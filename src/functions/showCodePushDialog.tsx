import { Alert } from 'react-native';
import CodePush from 'react-native-code-push';
import codePush from 'react-native-code-push';

const showCodePushDialog = (status: CodePush.SyncStatus) => {
  switch (status) {
    case codePush.SyncStatus.DOWNLOADING_PACKAGE:
      Alert.alert('업데이트를 다운로드 중입니다. 잠시 기다리세요');
      break;
    case codePush.SyncStatus.INSTALLING_UPDATE:
      Alert.alert('업데이트 설치 중입니다. 잠시 기다리세요');
      break;
    case codePush.SyncStatus.UPDATE_INSTALLED:
      Alert.alert(
        '업데이트가 설치되었습니다',
        `앱이 재시작합니다. 아래 "OK"를 터치해주세요`,
        [{ text: 'OK', onPress: () => codePush.allowRestart() }],
        { cancelable: false },
      );
      break;
  }
};

export default showCodePushDialog;
