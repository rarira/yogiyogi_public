import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ClassStatusType } from '../../API';
import { SET_CHATROOM_CLASS_STATUS } from '../../functions/useChatroomState';
import { TouchableOpacity } from 'react-native-gesture-handler';
import getClassStatus from '../../functions/getClassStatus';
import gql from 'graphql-tag';

import throttle from 'lodash/throttle';
import { updateClassStatus } from '../../customGraphqls';
import { useMutation } from '@apollo/react-hooks';
import ThemedButton from '../ThemedButton';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  classId: string;
  classStatus: ClassStatusType;
  chatroomDispatch?: any;
  isHost?: boolean;
  appearance: AppearanceType;
}

const TOGGLE_RESERVE_CLASS = gql(updateClassStatus);

const ClassReserveButton = ({ classId, classStatus, chatroomDispatch, isHost, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const [updateClass, { error, loading }] = useMutation(TOGGLE_RESERVE_CLASS);
  const toBeClassStatus =
    classStatus === ClassStatusType.reserved
      ? { classStatus: ClassStatusType.open, buttonText: `'구인 중'으로 변경`, color: theme.colors.primary }
      : { classStatus: ClassStatusType.reserved, buttonText: `'선생님 예약됨'으로 변경`, color: theme.colors.focus };

  const toggleReserveClassInput = {
    id: classId,
    classStatus: toBeClassStatus.classStatus,
  };

  const _handleToggleButton = () => {
    const mutationFunction = throttle(async () => {
      try {
        await updateClass({
          variables: { input: toggleReserveClassInput },
          optimisticResponse: {
            __typename: 'Mutation',
            updateClass: {
              __typename: 'Class',
              id: classId,
              classStatus: toBeClassStatus.classStatus,
            },
          },
        });

        if (chatroomDispatch) {
          chatroomDispatch({ type: SET_CHATROOM_CLASS_STATUS, classStatus: toBeClassStatus.classStatus });
        }
      } catch (e) {
        //스크린에서 처리할 수 있게 에러를 던짐
        throw e;
      }
    }, 1000);
    mutationFunction();
  };

  if (error) console.log(error);

  const nowStatus = getClassStatus(classStatus, appearance);
  if (chatroomDispatch) {
    if (!isHost) {
      if (classStatus === ClassStatusType.open) {
        return null;
      } else {
        return <Text style={[styles.classButtonText, { color: nowStatus.color }]}>{nowStatus.text}</Text>;
      }
    } else {
      if (classStatus === ClassStatusType.open || classStatus === ClassStatusType.reserved) {
        return (
          <ThemedButton mode="outlined" style={styles.buttonStyle} onPress={_handleToggleButton} loading={loading}>
            <Text style={[styles.classButtonText, { color: toBeClassStatus.color }]}>{toBeClassStatus.buttonText}</Text>
          </ThemedButton>
        );
      } else {
        return <Text style={[styles.classButtonText, { color: nowStatus.color }]}>{nowStatus.text}</Text>;
      }
    }
  }

  return (
    <TouchableOpacity onPress={_handleToggleButton} style={styles.buttonContainer}>
      <Text style={[styles.classButtonText, { color: toBeClassStatus.color }]}>{toBeClassStatus.buttonText}</Text>
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    buttonContainer: { alignSelf: 'center' },
    classButtonText: { fontSize: theme.fontSize.medium, fontWeight: '600' },
    buttonStyle: { backgroundColor: theme.colors.background, width: '100%' },
  });

export default memo(ClassReserveButton);
