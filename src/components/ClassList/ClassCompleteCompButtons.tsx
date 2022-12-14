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
      dialogTitle: '????????? ?????????',
      dialogContent:
        '????????? ?????? ???????????? ???????????? ????????? ????????? ????????? ??? ????????????. ?????? ???????????? ?????? ????????????. ????????? ???????????? ?????? ?????????????????????????',
      okText: '???????????????',
      dismissText: '??????',
      handleOk: _completeClass,
    });

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>???????????? ???????????? ???????????? ??????????</Text>
        <NextProcessButton
          mode="outlined"
          onPress={_handleNavToAllChat}
          color={theme.colors.focus}
          buttonStyle={styles.upButton}
          disabled={disabled}
          children="?????? ?????? ??????????????? ??????"
        />
        {/* <ThemedButton
          mode="outlined"
          onPress={_handleNavToAllChat}
          color={theme.colors.focus}
          style={styles.upButton}
          disabled={disabled}
        >
          ?????? ?????? ??????????????? ??????
        </ThemedButton> */}
        {/* <Text style={{ marginBottom: theme.size.small }}>???????????? ???????????? ????????? ?????? ??? ??????????</Text> */}
      </View>
      <NextProcessButton
        mode="contained"
        onPress={_handleCompleteWithoutProxy}
        color={theme.colors.error}
        disabled={disabled}
      >
        ????????? ?????? ???????????? ?????? ??????
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
