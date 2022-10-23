import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme, { IS_TABLET, getThemeColor } from '../../configs/theme';

import { AppearanceType } from '../../types/store';
import RNUrlPreview from 'react-native-url-preview';
import { useStoreState } from '../../stores/initStore';

interface Props {
  URL?: string;
  thumbnailURL?: string;
}
const PostLinkBox = ({ URL, thumbnailURL }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  if (!URL) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.textStyle}>공유 링크 미리 보기</Text>
      <RNUrlPreview
        text={URL}
        imageStyle={styles.previewImageStyle}
        containerStyle={styles.previewContainer}
        textContainerStyle={styles.previewTextContainer}
        thumbnailURL={thumbnailURL}
        titleStyle={styles.titleTextStyle}
        descriptionStyle={styles.descriptionTextStyle}
      />
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      // marginVertical: theme.size.medium,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      borderColor: getThemeColor('disabled', appearance),
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: theme.size.big,
      backgroundColor: getThemeColor('uiBackground', appearance),
    },
    previewContainer: {
      alignItems: 'center',
      // marginTop: theme.size.normal,
      // width: '100%',
      paddingVertical: 0,
      marginVertical: theme.size.small,
    },
    previewImageStyle: {
      width: IS_TABLET ? 160 : 110,
      height: IS_TABLET ? 160 : 110,
      // paddingRight: 5,
      // paddingLeft: 5,
      // backgroundColor: theme.colors.background,
      // borderColor: 'red',
      // borderWidth: 1,
    },
    previewTextContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingHorizontal: 10,
    },
    textStyle: {
      paddingTop: theme.size.small,
      color: getThemeColor('text', appearance),
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      // paddingHorizontal: theme.size.big,
    },
    titleTextStyle: {
      color: getThemeColor('text', appearance),
    },
    descriptionTextStyle: {
      color: getThemeColor('placeholder', appearance),
    },
  });
export default memo(PostLinkBox);
