import React, { memo } from 'react';
import KoreanParagraph from './KoreanParagraph';
import theme from '../configs/theme';
import { StyleSheet, StyleProp, TextStyle, ViewStyle } from 'react-native';

interface Props {
  text: string;
  textStyle?: StyleProp<TextStyle>;
  paragraphStyle?: StyleProp<ViewStyle>;
}

const BlockedKoreanParagraph = ({ text, textStyle, paragraphStyle }: Props) => {
  const splitArray = text ? text.split('\n') : [];

  return (
    <>
      {splitArray.map((paragraph: string, index: number) => (
        <KoreanParagraph
          text={paragraph}
          key={index}
          textStyle={textStyle || styles.defaultTextStyle}
          paragraphStyle={paragraphStyle}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  defaultTextStyle: { fontSize: theme.fontSize.medium },
});

export default memo(BlockedKoreanParagraph);
