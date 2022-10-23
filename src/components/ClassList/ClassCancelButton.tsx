import { END_OF_DAY, RATING_SCORE } from '../../configs/variables';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ClassStatusType } from '../../API';
import { WarningProps } from '../WarningDialog';
import gql from 'graphql-tag';

import throttle from 'lodash/throttle';
import { updateClassStatus } from '../../customGraphqls';
import { useMutation } from '@apollo/react-hooks';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  classStatus: ClassStatusType;
  setWarningProps?: (arg: Partial<WarningProps> | null) => void;
  classId: string;
  timeStart: number;
  appearance: AppearanceType;
}

const TOGGLE_CANCEL_CLASS = gql(updateClassStatus);

const ClassCancelButton = ({ classId, setWarningProps, classStatus, timeStart, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const [updateClass, { error, loading }] = useMutation(TOGGLE_CANCEL_CLASS);

  const nowEpochSec = new Date().getTime() / 1000;
  const toBeClassStatus =
    classStatus === ClassStatusType.cancelled && timeStart > nowEpochSec
      ? { classStatus: ClassStatusType.open, buttonText: `'구인 중'으로 변경`, color: theme.colors.primary }
      : classStatus === ClassStatusType.open
      ? { classStatus: ClassStatusType.cancelled, buttonText: `클래스 취소`, color: theme.colors.accent }
      : { classStatus: null, buttonText: '클래스 취소됨', color: theme.colors.disabled };

  const _handleWarnings = (handleOk: () => void, loading: boolean) => {
    const minusScore = RATING_SCORE.hostCancelledClass;
    const dialogContent =
      toBeClassStatus.classStatus === ClassStatusType.cancelled
        ? `지금 클래스를 취소하시면 호스트점수가 ${minusScore}만큼 깍입니다. 그래도 클래스를 취소하시겠습니까?`
        : `취소한 클래스를 다시 오픈합니다`;
    setWarningProps!({
      dialogTitle: toBeClassStatus.buttonText,
      dialogContent,
      handleOk,
      okText: '예',
      loading,
    });
  };

  const _handleToggleButton = () => {
    const mutationFunction = throttle(async () => {
      const cancelClassInput = {
        id: classId,
        classStatus: toBeClassStatus.classStatus,
        expiresAt: toBeClassStatus.classStatus === ClassStatusType.cancelled ? END_OF_DAY : timeStart,
      };
      try {
        await updateClass({
          variables: { input: cancelClassInput },
          // refetchQueries,
          optimisticResponse: {
            __typename: 'Mutation',
            updateClass: {
              __typename: 'Class',
              ...cancelClassInput,
            },
          },
          // update: store => {
          //   const removeFromItem = (variables: any) => {
          //     const queryResult: any = store.readQuery({
          //       query: LIST_CLASS,
          //       variables,
          //     });
          //     const { items, ...others } = queryResult.searchClasss;
          //     const newItems = items.filter((item: ClassData) => item.id !== classId);
          //     const newData = {
          //       searchClasss: {
          //         items: newItems,
          //         ...others,
          //       },
          //     };
          //     store.writeQuery({ query: LIST_CLASS, variables, data: newData });
          //   };

          //   if (toBeClassStatus.classStatus === ClassStatusType.open) {
          //     removeFromItem(queryInputOff);
          //   } else if (toBeClassStatus.classStatus === ClassStatusType.cancelled) {
          //     removeFromItem(queryInputOn);
          //   }
          // },
        });
      } catch (e) {
        //스크린에서 처리할 수 있게 에러를 던짐
        throw e;
      }
    }, 1000);
    if (setWarningProps) {
      _handleWarnings(mutationFunction, loading);
    } else {
      mutationFunction();
    }
  };

  if (error) console.log(error);

  return (
    <TouchableOpacity
      disabled={toBeClassStatus.classStatus === null}
      onPress={_handleToggleButton}
      style={styles.buttonContainer}
    >
      <Text style={[styles.classButtonText, { color: toBeClassStatus.color }]}>{toBeClassStatus.buttonText}</Text>
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    buttonContainer: { alignSelf: 'center' },
    marginLeft: { marginLeft: theme.size.normal },
    fontSizeNormal: { fontSize: theme.fontSize.normal },
    classButtonText: { fontSize: theme.fontSize.medium, fontWeight: '600' },
  });

export default memo(ClassCancelButton);
