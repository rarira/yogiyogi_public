import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStoreState } from '../../stores/initStore';

interface Props extends TouchableWithoutFeedbackProps {
  needMarginRight?: boolean;
  size?: number;

  handleNavToComment(): void;
}
const PostCommentButton = ({ needMarginRight, size, handleNavToComment, ...rest }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  // console.log('reload, ', bookmarked, item);

  const _handleOnPress = () => {
    handleNavToComment();
  };

  const color = getThemeColor('placeholder', appearance);

  // if (!user) return null;
  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      {...(needMarginRight && { style: styles.mediumMarginRight })}
    >
      <Icon name={'comment-multiple-outline'} size={size || theme.iconSize.big} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mediumMarginRight: { marginRight: theme.size.medium },
});

export default memo(PostCommentButton);
