import reportSentry from '../functions/reportSentry'

import { Alert } from 'react-native';
import { ClassStatusType } from '../API';
import { MutationFunction } from '@apollo/react-common';

const classToggleReserve = (
  updateClassStatus: MutationFunction,
  classId: string,
  classStatus: ClassStatusType,
) => async () => {
  const toBeClassStatus =
    classStatus === ClassStatusType.reserved
      ? { status: ClassStatusType.open, message: `'구인 중'으로 변경` }
      : { status: ClassStatusType.reserved, message: `'예약 중'으로 변경` };

  try {
    await updateClassStatus({
      variables: { input: { id: classId, classStatus: toBeClassStatus.status } },
      optimisticResponse: {
        __typename: 'Mutation',
        updateClass: {
          __typename: 'Class',
          id: classId,
          classStatus: toBeClassStatus.status,
        },
      },
    });

    Alert.alert(`${toBeClassStatus.message} 완료`);
  } catch (e) {
    reportSentry(e);

    Alert.alert('에러 발생', e.message);
  }
};

export default classToggleReserve;
