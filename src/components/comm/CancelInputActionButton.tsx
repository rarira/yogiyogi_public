import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { CANCEL_COMMENT_INPUT } from '../../stores/actionTypes';
import KoreanParagraph from '../KoreanParagraph';
import React from 'react';

interface CancelInputActionButtonProps {
  // handleOnPress(): void;
  // type: string;
  needMarginRight?: boolean;
  keyboardHeight: number;
}

const CancelInputActionButton = ({ needMarginRight, keyboardHeight }: CancelInputActionButtonProps) => {
  const {
    authStore: { appearance },
    commentStore: { content, editComment, replyToComment },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const _handleOnPress = () => {
    storeDispatch({ type: CANCEL_COMMENT_INPUT });
    Keyboard.dismiss();
  };
  const type = !!replyToComment ? '답글' : !!editComment ? '수정' : !!content ? '댓글' : null;

  if (type === null) return null;

  return (
    <TouchableOpacity
      {...(needMarginRight && keyboardHeight > 0 && { style: styles.mediumMarginRight })}
      onPress={_handleOnPress}
      hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
    >
      <KoreanParagraph
        textStyle={[styles.text, { color: getThemeColor('error', appearance) }]}
        text={`${type} 취소`}
        paragraphStyle={styles.paragraph}
      />
    </TouchableOpacity>
  );
};

export default CancelInputActionButton;

const styles = StyleSheet.create({
  // container: {},
  text: {
    fontSize: theme.fontSize.medium,
    marginLeft: theme.size.xs,
    fontWeight: '600',
    // flexWrap: 'wrap',
  },
  paragraph: { flexWrap: 'nowrap' },
  mediumMarginRight: { marginRight: theme.size.medium },
});
