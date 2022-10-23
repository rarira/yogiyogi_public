import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { CANCEL_COMMENT_INPUT } from '../../stores/actionTypes';
import KoreanParagraph from '../KoreanParagraph';
import React from 'react';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface BackToPostButtonProps extends NavigationInjectedProps {
  // handleOnPress(): void;
  // type: string;
  // origin: string;
  needMarginLeft?: boolean;
  // keyboardHeight: number;
  appearance: AppearanceType;
}

const BackToPostButton = ({ needMarginLeft, navigation, appearance }: BackToPostButtonProps) => {
  const {
    commentStore: { postId },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _handleOnPress = () => {
    storeDispatch({ type: CANCEL_COMMENT_INPUT });
    navigation.navigate('PostView', { postId });
  };

  return (
    <TouchableOpacity
      {...(needMarginLeft && { style: styles.mediumMarginLeft })}
      onPress={_handleOnPress}
      hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
    >
      <KoreanParagraph textStyle={styles.text} text={'게시물로'} paragraphStyle={styles.paragraph} />
    </TouchableOpacity>
  );
};

export default withNavigation(BackToPostButton);

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    // container: {},
    text: {
      color: theme.colors.iosBlue,
      fontSize: theme.fontSize.medium,
      marginLeft: theme.size.xs,
      fontWeight: '600',
      // flexWrap: 'wrap',
    },
    paragraph: { flexWrap: 'nowrap' },
    mediumMarginLeft: { marginLeft: theme.size.medium },
  });
