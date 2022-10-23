import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import { AppearanceType } from '../../types/store';
import BasicParsedText from '../BasicParsedText';
import { useStoreState } from '../../stores/initStore';

interface Props {
  postContent: string;
}

const PostContentBox = ({ postContent }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);
  return (
    <View style={styles.container}>
      <BasicParsedText text={postContent} />
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      // flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: getThemeColor('background', appearance),
      paddingHorizontal: theme.size.big,
      paddingVertical: theme.size.medium,
    },
  });

export default memo(PostContentBox);
