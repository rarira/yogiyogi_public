import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

// import { Button } from 'react-native-paper';
import React from 'react';
import { useStoreState } from '../../stores/initStore';

interface Props {
  numOfComments: number;
  handleNavToComment(): void;
}
const PostCommentsHeader = ({ numOfComments, handleNavToComment }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const color = getThemeColor('text', appearance);
  const buttonTextColor = getThemeColor('primary', appearance);
  return (
    <View style={styles.rowStyle}>
      <Text style={[styles.textStyle, { color }]}>댓글 {numOfComments}개</Text>
      <TouchableOpacity onPress={handleNavToComment}>
        <Text style={[styles.textStyle, { color: buttonTextColor }]}>댓글 작성</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rowStyle: {
    // width: '100%',
    marginVertical: theme.size.normal,
    marginHorizontal: theme.size.big,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textStyle: {
    // paddingTop: theme.size.small,
    fontSize: theme.fontSize.medium,
    fontWeight: '600',
    // paddingHorizontal: theme.size.big,
  },
});

export default PostCommentsHeader;
