import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import { customAddClassBlock, updateClassStatus } from '../customGraphqls';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import { ClassData } from '../types/apiResults';
import { GetClassQuery } from '../API';
import Icon from 'react-native-vector-icons/MaterialIcons';
import React from 'react';
import { WarningProps } from './WarningDialog';
import debounce from 'lodash/debounce';
import gql from 'graphql-tag';
import openClassHostActionSheet from '../functions/openClassHostActionSheet';
import openClassUserActionSheet from '../functions/openClassUserActionSheet';

import { useActionSheet } from '@expo/react-native-action-sheet';
import { useMutation } from '@apollo/react-hooks';
import { getTheme } from '../configs/theme';

const ADD_CLASS_BLOCK = gql(customAddClassBlock);
const UPDATE_CLASS_STATUS = gql(updateClassStatus);

interface Props extends TouchableWithoutFeedbackProps, NavigationInjectedProps {
  classItem: Partial<GetClassQuery['getClass']> | ClassData;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  refetch: any;
  isHost: boolean;
  origin: string;
  parallaxHeaderVisible?: boolean;
  needMarginRight?: boolean;
  isClassView?: boolean;
  setModalVisible?: (arg: boolean) => void;
}
const ClassActionMenuButton = ({
  classItem,
  needMarginRight,
  parallaxHeaderVisible,
  isClassView,
  setWarningProps,
  refetch,
  navigation,
  isHost,
  setModalVisible,
  origin,

  ...rest
}: Props) => {
  const [addClassBlock] = useMutation(ADD_CLASS_BLOCK);
  const [updateClassStatus] = useMutation(UPDATE_CLASS_STATUS);
  const { showActionSheetWithOptions } = useActionSheet();

  const storeDispatch = useStoreDispatch();
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const theme = getTheme(appearance);

  const _handleOnPress = debounce(
    () => {
      if (isHost) {
        openClassHostActionSheet({
          classItem,
          showActionSheetWithOptions,
          refetch,
          updateClassStatus,
          navigation,
          origin,
          storeDispatch,
          setWarningProps,
          appearance,
        })();
      } else {
        openClassUserActionSheet({
          classItem,
          showActionSheetWithOptions,
          refetch,
          setWarningProps,
          user,
          navigation,
          origin,
          addClassBlock,
          setModalVisible,
          appearance,
        })();
      }
    },
    1000,
    { leading: true, trailing: false },
  );

  const color = isClassView && parallaxHeaderVisible ? theme.colors.background : theme.colors.placeholder;

  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      {...(needMarginRight && { style: { marginRight: theme.size.medium } })}
    >
      <Icon name="menu" size={theme.iconSize.big} color={color} />
    </TouchableOpacity>
  );
};

export default withNavigation(ClassActionMenuButton);
