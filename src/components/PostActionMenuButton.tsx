import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import { customAddPostBlock, updatePostStatus } from '../customGraphqls';
import theme, { getThemeColor } from '../configs/theme';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { PostData } from '../types/store';
import React from 'react';
import { WarningProps } from './WarningDialog';
import gql from 'graphql-tag';
import openPostAuthorActionSheet from '../functions/openPostAuthorActionSheet';
import openPostUserActionSheet from '../functions/openPostUserActionSheet';
import throttle from 'lodash/throttle';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useMutation } from '@apollo/react-hooks';

const ADD_POST_BLOCK = gql(customAddPostBlock);
const UPDATE_POST_STATUS = gql(updatePostStatus);

interface Props extends TouchableWithoutFeedbackProps, NavigationInjectedProps {
  postItem: PostData;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  refetch: any;
  isAuthor: boolean;
  origin: string;
  needMarginRight?: boolean;
  isPostView?: boolean;
  setModalVisible?: (arg: boolean) => void;
  imgURLs: string[];
}
const PostActionMenuButton = ({
  postItem,
  needMarginRight,
  isPostView,
  setWarningProps,
  refetch,
  navigation,
  isAuthor,
  setModalVisible,
  origin,
  imgURLs,
  ...rest
}: Props) => {
  const [addPostBlock] = useMutation(ADD_POST_BLOCK);
  const [updatePostStatus] = useMutation(UPDATE_POST_STATUS);
  const { showActionSheetWithOptions } = useActionSheet();

  const storeDispatch = useStoreDispatch();
  const {
    authStore: { user, appearance },
  } = useStoreState();

  const _handleOnPress = throttle(() => {
    if (isAuthor) {
      openPostAuthorActionSheet({
        postItem,
        showActionSheetWithOptions,
        refetch,
        updatePostStatus,
        navigation,
        origin,
        storeDispatch,
        setWarningProps,
        imgURLs,
        appearance,
      })();
    } else {
      openPostUserActionSheet({
        postId: postItem.id,
        showActionSheetWithOptions,
        refetch,
        setWarningProps,
        user,
        navigation,
        origin,
        addPostBlock,
        setModalVisible,
        appearance,
      })();
    }
  }, 1000);

  const color = getThemeColor('placeholder', appearance);

  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      {...(needMarginRight && { style: styles.mediumMarginRight })}
    >
      <Icon name="menu" size={theme.iconSize.big} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mediumMarginRight: { marginRight: theme.size.medium },
});

export default withNavigation(PostActionMenuButton);
