import React, { memo } from 'react';
import theme, { getThemeColor } from '../../configs/theme';

import { AppearanceType } from '../../types/store';
import KoreanParagraph from '../KoreanParagraph';
import { StyleSheet } from 'react-native';
import { useStoreState } from '../../stores/initStore';

const PostWarning = () => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  return (
    <KoreanParagraph
      text={`본 게시물의 내용은 작성자가 등록한 것으로 "요기요기"와는 아무런 관련이 없습니다. 문제가 있는 게시물의 경우 상단의 메뉴 버튼을 이용하여 신고해 주세요`}
      textStyle={styles.text}
      paragraphStyle={styles.container}
    />
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      backgroundColor: getThemeColor('uiBackground', appearance),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: getThemeColor('disabled', appearance),
      paddingHorizontal: theme.size.big,
      paddingVertical: theme.size.small,
      marginTop: theme.size.normal,
    },
    text: {
      color: getThemeColor('backdrop', appearance),
      // fontWeight: '600',
      fontSize: theme.fontSize.small,
    },
  });

export default memo(PostWarning);
