import { Paragraph } from 'react-native-paper';
import { ClassStatusType, GetClassQuery } from '../../API';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { Dispatch, memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppearanceType, StoreAction } from '../../types/store';
import { WarningProps } from '../WarningDialog';
import gql from 'graphql-tag';
import openClassHostActionSheet from '../../functions/openClassHostActionSheet';
import theme, { getThemeColor } from '../../configs/theme';
import { updateClassStatus } from '../../customGraphqls';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useMutation } from '@apollo/react-hooks';
import ThemedButton from '../ThemedButton';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationInjectedProps {
  classItem: Partial<GetClassQuery['getClass']>;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  refetch: any;
  storeDispatch: Dispatch<StoreAction>;
}
const UPDATE_CLASS_STATUS = gql(updateClassStatus);

const HostCard = ({ classItem, navigation, refetch, storeDispatch, setWarningProps }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);
  const nowEpochSec = new Date().getTime() / 1000;
  const [updateClassStatus] = useMutation(UPDATE_CLASS_STATUS);
  const { showActionSheetWithOptions } = useActionSheet();

  return (
    <View style={styles.container}>
      <Paragraph style={styles.textStyle}>당신은 본 클래스의 호스트입니다</Paragraph>
      {!(classItem!.classStatus === ClassStatusType.cancelled && classItem!.timeStart! <= nowEpochSec) && (
        <ThemedButton
          mode="contained"
          onPress={openClassHostActionSheet({
            classItem,
            showActionSheetWithOptions,
            refetch,
            updateClassStatus,
            navigation,
            origin: 'ClassView',
            storeDispatch,
            setWarningProps,
            appearance,
          })}
        >
          <Text style={styles.buttonText}>클래스 관리하기</Text>
        </ThemedButton>
      )}
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      // flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: theme.size.big,
    },
    textStyle: { color: getThemeColor('background', appearance), fontWeight: '800', fontSize: theme.fontSize.medium },
    buttonStyle: {
      justifyContent: 'flex-end',
      marginTop: theme.size.normal,
      marginBottom: theme.size.normal,
    },
    buttonText: {
      color: getThemeColor('background', appearance),
      fontWeight: '800',
      fontSize: theme.fontSize.normal,
    },
  });

export default memo(withNavigation(HostCard));
