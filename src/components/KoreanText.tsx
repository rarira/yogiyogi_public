import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import React from 'react';
import { AppearanceType } from '../types/store';
import { getThemeColor } from '../configs/theme';

interface Props extends TextProps {
  str: string;
  textStyle: StyleProp<TextStyle>;
  appearance: AppearanceType;
}
const KoreanText = ({ str, textStyle, appearance, ...others }: Props) => {
  return (
    <>
      {str.split(' ').map((word, index) => (
        <Text
          style={[{ color: getThemeColor('text', appearance) }, textStyle, { flexShrink: 1 }]}
          key={index}
          {...others}
        >
          {`${word} `}
        </Text>
      ))}
    </>
  );
};

export default React.memo(KoreanText);
