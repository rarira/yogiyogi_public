import React, { memo } from 'react';
import { StyleSheet, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native';

import { getTheme } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

export interface KoreanParagraphProps extends TextProps {
  text: string;
  paragraphStyle?: ViewStyle;
  textStyle?: TextStyle;
  focusTextStyle?: TextStyle;
}

const KoreanParagraph = ({ text, paragraphStyle, textStyle, focusTextStyle, ...others }: KoreanParagraphProps) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  let wordArray: string[] = [];

  if (focusTextStyle) {
    let word: string = '';
    const tempArray = [...text];
    const length = tempArray.length;
    tempArray.forEach((c, index) => {
      if (index === length - 1) {
        word = word.concat(c);
        wordArray.push(word);
      } else if (c === ' ' && word) {
        wordArray.push(word);
        word = '';
      } else if (c === `"` && word.startsWith('_&&_')) {
        word = word.slice(4);
        word = word.concat(c);
      } else {
        const endOfWordIndex = wordArray.length - 1;
        if (
          wordArray.length !== 0 &&
          (wordArray[endOfWordIndex].startsWith(`"`) || wordArray[endOfWordIndex].startsWith(`_&&_`)) &&
          !wordArray[endOfWordIndex].endsWith(`"`) &&
          !word.endsWith(`"`) &&
          word === ''
        ) {
          word = word.concat('_&&_');
        }
        word = word.concat(c);
      }
    });
  } else {
    wordArray = text.split(' ');
  }

  return (
    <View style={[styles.container, paragraphStyle]}>
      {wordArray.map((word, index) => {
        if (word.startsWith(`"`) || word.endsWith(`"`)) {
          return (
            <Text style={[styles.text, textStyle, focusTextStyle]} key={index} {...others}>
              {word}{' '}
            </Text>
          );
        } else if (word.startsWith(`_&&_`)) {
          const newWord = word.slice(4);
          return (
            <Text style={[styles.text, textStyle, focusTextStyle]} key={index} {...others}>
              {newWord}{' '}
            </Text>
          );
        } else {
          return (
            <Text style={[styles.text, textStyle]} key={index} {...others}>
              {word}{' '}
            </Text>
          );
        }
      }, false)}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { flexDirection: 'row', flexWrap: 'wrap' },
    text: {
      color: theme.colors.text,
      fontSize: theme.fontSize.normal,
    },
  });

export default memo(KoreanParagraph);
