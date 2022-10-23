import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import ClassCancelButton from './ClassCancelButton';
import ClassCompleteButton from './ClassCompleteButton';
import ClassHostReviewButton from './ClassHostReviewButton';
import ClassReserveButton from './ClassReserveButton';
import { ClassStatusType } from '../../API';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  classStatus: ClassStatusType;
  id: string;
  hostId: string;
  hostName: string | null;
  isHost: boolean;
  timeStart: number;
  appearance: AppearanceType;
}

const TabClassButton = ({ classStatus, id, hostId, hostName, isHost, timeStart, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  switch (classStatus) {
    case ClassStatusType.open:
      return <ClassReserveButton classId={id} classStatus={classStatus} appearance={appearance} />;
    case ClassStatusType.reserved:
      return <ClassReserveButton classId={id} classStatus={classStatus} appearance={appearance} />;
    case ClassStatusType.closed:
      return <ClassCompleteButton classId={id} origin={'ClassList'} hostId={hostId} appearance={appearance} />;
    case ClassStatusType.completed:
      return <Text style={styles.disabledClassStatus}>클래스 수행 완료</Text>;
    case ClassStatusType.proxied:
      if (isHost) {
        return <Text style={styles.disabledClassStatus}>선생님 리뷰 작성 완료</Text>;
      } else {
        return (
          <ClassHostReviewButton
            classId={id}
            isClassList
            origin={'ClassList'}
            hostId={hostId}
            hostName={hostName!}
            appearance={appearance}
          />
        );
      }
    case ClassStatusType.reviewed:
      return <Text style={styles.disabledClassStatus}>호스트 리뷰 작성 완료</Text>;

    case ClassStatusType.cancelled:
      return <ClassCancelButton classId={id} classStatus={classStatus} timeStart={timeStart} appearance={appearance} />;
    default:
      return null;
  }
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    disabledClassStatus: {
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      color: theme.colors.disabled,
      alignSelf: 'center',
    },
  });

export default memo(TabClassButton);
