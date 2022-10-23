import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import KoreanParagraph from './KoreanParagraph';
import { resetHearts } from '../functions/manageHearts';
import { getTheme } from '../configs/theme';

const HeartsClearButton = () => {
  const {
    authStore: { hearts, appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const storeDispatch = useStoreDispatch();
  const _handleOnPress = () => resetHearts({ storeDispatch, hearts });
  const disabled = hearts.count === 0;

  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
      // style={styles.container}
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
    container: { flexDirection: 'row', alignItems: 'center' },
    text: {
      color: theme.colors.placeholder,
      fontSize: theme.fontSize.medium,
      // marginLeft: theme.size.xs,
    },
    paragraph: { flexWrap: 'nowrap' },
  });

export default memo(HeartsClearButton);
