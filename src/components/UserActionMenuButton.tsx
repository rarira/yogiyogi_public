import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { WarningProps } from './WarningDialog';
import { customAddUserBlock } from '../customGraphqls';
import gql from 'graphql-tag';
import openUserActionSheet from '../functions/openUserActionSheet';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useMutation } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { getTheme } from '../configs/theme';

const ADD_USER_BLOCK = gql(customAddUserBlock);
interface Props extends TouchableWithoutFeedbackProps, NavigationInjectedProps {
  userId: string;
  userName: string;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  refetch: any;
  setModalVisible?: (arg: boolean) => void;
  origin: string;
  needMarginRight?: boolean;
  isReviewable: boolean;
}
const UserActionMenuButton = ({
  userId,
  userName,
  needMarginRight,
  setWarningProps,
  refetch,
  navigation,
  setModalVisible,
  origin,
  isReviewable,
  ...rest
}: Props) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const [addUserBlock] = useMutation(ADD_USER_BLOCK);
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _handleOnPress = () => {
    openUserActionSheet({
      userId,
      showActionSheetWithOptions,
      refetch,
      addUserBlock,
      setWarningProps,
      user,
      setModalVisible,
      navigation,
      isReviewable,
      userName,
      origin,
      appearance,
    })();
  };

  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      {...(needMarginRight && { style: styles.mediumMarginRight })}
    >
      <Icon name="menu" size={theme.iconSize.big} color={theme.colors.placeholder} />
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    mediumMarginRight: { marginRight: theme.size.medium },
  });

export default memo(withNavigation(UserActionMenuButton));
