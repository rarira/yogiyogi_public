import { END_OF_DAY, RATING_SCORE } from '../configs/variables';

import { Alert } from 'react-native';
import { ClassStatusType } from '../API';
import { MutationFunction } from '@apollo/react-common';
import { WarningProps } from '../components/WarningDialog';
import reportSentry from '../functions/reportSentry';

const classToggleCancel = (
  updateClassStatus: MutationFunction,
  classId: string,
  classStatus: ClassStatusType,
  setWarningProps: (arg: Partial<WarningProps> | null) => void,
  timeStart: number,
  origin: string,
  hostId?: string,
) => () => {
  const toBeClassStatus =
    classStatus === ClassStatusType.cancelled
      ? { status: ClassStatusType.open, message: `'구인 중'으로 변경` }
      : { status: ClassStatusType.cancelled, message: `클래스 취소` };

  const cancelClassInput = {
    id: classId,
    classStatus: toBeClassStatus.status,
    expiresAt: toBeClassStatus.status === ClassStatusType.cancelled ? END_OF_DAY : timeStart,
  };

  const minusScore = RATING_SCORE.hostCancelledClass;
  const dialogContent =
    toBeClassStatus.status === ClassStatusType.cancelled
      ? `지금 클래스를 취소하시면 호스트 점수가 ${minusScore}만큼 깍입니다. 그래도 클래스를 취소하시겠습니까?`
      : `취소한 클래스를 다시 '구인 중'으로 변경합니다`;

  const _handleCancel = async () => {
    try {
      await updateClassStatus({
        variables: { input: cancelClassInput },
        optimisticResponse: {
          __typename: 'Mutation',
          updateClass: {
            __typename: 'Class',
            ...cancelClassInput,
          },
        },
      });

      Alert.alert(`${toBeClassStatus.message} 완료`);
    } catch (e) {
      reportSentry(e);

      Alert.alert('에러 발생', e.message);
    }
  };

  setWarningProps!({
    dialogTitle: toBeClassStatus.message,
    dialogContent,
    handleOk: _handleCancel,
    okText: '예',
  });
};

export default classToggleCancel;
