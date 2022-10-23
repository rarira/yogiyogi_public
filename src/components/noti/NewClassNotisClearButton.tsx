import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import KoreanParagraph from '../KoreanParagraph';
import { resetNewClassNotis } from '../../functions/manageNewClassNotis';
import { getTheme } from '../../configs/theme';

const NewClassNotisClearButton = () => {
  const {
    authStore: { newClassNotis, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const _handleOnPress = () => resetNewClassNotis({ storeDispatch, newClassNotis });
  const disabled = newClassNotis.items.length === 0;

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
      style={styles.container}
      disabled={disabled}
    >
      <KoreanParagraph
        textStyle={[styles.text, disabled && { color: theme.colors.disabled }]}
        text={'모두 삭제'}
        paragraphStyle={styles.paragraph}
      />
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { marginRight: theme.size.small },
    text: {
      color: theme.colors.placeholder,
      fontSize: theme.fontSize.medium,
      // marginLeft: theme.size.xs,
    },
    paragraph: { flexWrap: 'nowrap' },
  });

export default memo(NewClassNotisClearButton);
