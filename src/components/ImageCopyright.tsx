import React, { memo } from 'react';
import { Text, View } from 'react-native';

import { getTheme } from '../configs/theme';
import { AppearanceType } from '../types/store';

interface Props {
  copyright: string;
  appearance: AppearanceType;
}
const ImageCopyright = ({ copyright, appearance }: Props) => {
  const theme = getTheme(appearance);

  const styles = {
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.size.small,
      marginBottom: 100,
      marginHorizontal: theme.size.big,
    },
    copyrightText: { fontSize: theme.fontSize.small, fontWeight: '600', color: theme.colors.backdrop },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.copyrightText}>{copyright}</Text>
    </View>
  );
};

export default memo(ImageCopyright);
