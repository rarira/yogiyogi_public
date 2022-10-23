import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ClassStatusType } from '../../API';
import { END_OF_DAY } from '../../configs/variables';
import NextProcessButton from '../NextProcessButton';
import { WarningProps } from '../WarningDialog';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';

import { updateClassStatus } from '../../customGraphqls';
import { useMutation } from '@apollo/react-hooks';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  classId: string;
  hostId: string;
  handleBack: () => void;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  origin: string;
  disabled?: boolean;
  appearance: AppearanceType;
}

const COMPLETE_CLASS = gql(updateClassStatus);
const ClassCompleteCompButtons = ({
  classId,
  hostId,
  navigation,
  handleBack,
  setWarningProps,
  snackbarDispatch,
  origin,
  disabled,
  appearance,
}: Props) => {
  const [completeClass] = useMutation(COMPLETE_CLASS);

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _completeClass = async () => {
    const completeClassInput = {
      id: classId,
      classStatus: ClassStatusType.completed,
      expiresAt: END_OF_DAY,
    };
    try {
      await completeClass({
        variables: {
          input: completeClassInput,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateClass: {
            __typename: 'Class',
            ...completeClassInput,
          },
        },
      });
      handleBack();
    } catch (e) {
      reportSentry(e);
      snackbarDispatch({ type: OPEN_SNACKBAR, message: e.message });
    }
  };
  const _handleNavToAllChat = () => navigation.push('AllChatList', { hostId, origin, classId });
  const _handleCompleteWithoutProxy = () =>
    setWarningProps({
      dialogTitle: '선생님 미선택',
      dialogContent:
        '클래스 수행 선생님을 선택하지 않으면 리뷰를 남기실 수 없습니다. 다시 선택하실 수도 없습니다. 그래도 선택하지 않고 완료하시겠습니까?',
      okText: '완료합니다',
      dismissText: '취소',
      handleOk: _completeClass,
    });

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>담당하신 선생님이 리스트에 없나요?</Text>
        <NextProcessButton
          mode="outlined"
          onPress={_handleNavToAllChat}
          color={theme.colors.focus}
          buttonStyle={styles.upButton}
          disabled={disabled}
          children="전체 채팅 리스트에서 찾기"
        />
        {/* <ThemedButton
          mode="outlined"
          onPress={_handleNavToAllChat}
          color={theme.colors.focus}
          style={styles.upButton}
          disabled={disabled}
        >
          전체 채팅 리스트에서 찾기
        </ThemedButton> */}
        {/* <Text style={{ marginBottom: theme.size.small }}>외부에서 선생님을 구해서 찾을 수 없나요?</Text> */}
      </View>
      <NextProcessButton
        mode="contained"
        onPress={_handleCompleteWithoutProxy}
        color={theme.colors.error}
        disabled={disabled}
      >
        선생님 리뷰 작성하지 않고 완료
      </NextProcessButton>
    </>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingTop: theme.size.big,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.borderColor,
    },
    text: { marginBottom: theme.size.small, fontSize: theme.size.medium },
    upButton: { marginBottom: theme.size.big, paddingHorizontal: theme.size.big },
  });
export default memo(withNavigation(ClassCompleteCompButtons));
