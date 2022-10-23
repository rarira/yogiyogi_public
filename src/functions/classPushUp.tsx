import { Alert } from 'react-native';
import { ClassStatusType } from '../API';
import { MutationFunction } from '@apollo/react-common';
import reportSentry from '../functions/reportSentry';

const classPushUp = (
  updateClassStatus: MutationFunction,
  classId: string,
  classStatus: ClassStatusType,
  refetch: any,
  updateCounter: number,
  isTabClassList?: boolean,
) => async () => {
  const timeNow = new Date();

  try {
    if (updateCounter >= 10) {
      throw new Error('끌어 올리기 가능 회수 (10회) 초과');
    }
    await updateClassStatus({
      variables: {
        input: {
          id: classId,
          createdAt: timeNow.toISOString(),
          createdAtEpoch: Math.floor(timeNow.getTime() / 1000),
          updateCounter: 1,
        },
      },
      optimisticResponse: {
        __typename: 'Mutation',
        updateClass: {
          __typename: 'Class',
          id: classId,
          classStatus,
          createdAt: timeNow,
        },
      },
    });

    if (isTabClassList) {
      await refetch();
    }

    Alert.alert('끌어 올리기 완료');
  } catch (e) {
    reportSentry(e);

    Alert.alert('에러 발생', e.message);
  }
};
export default classPushUp;
