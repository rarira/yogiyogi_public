import theme, { getThemeColor } from '../configs/theme';

import KoreanParagraph from './KoreanParagraph';
import React from 'react';
import { useStoreState } from '../stores/initStore';

interface Props {
  marginBottom?: number;
  marginTop?: number;
  alignCenter?: boolean;
  text: string;
  bold?: boolean;
  fontSize?: number;
}

const HeadlineSub = ({ text, marginTop, marginBottom, alignCenter, bold, fontSize }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  return (
    <KoreanParagraph
      text={text}
      textStyle={{
        fontSize: fontSize || theme.fontSize.medium,
        color: getThemeColor('placeholder', appearance),
        lineHeight: theme.fontSize.big,
        fontWeight: bold ? 'bold' : 'normal',
      }}
      paragraphStyle={{
        marginTop: marginTop !== undefined ? marginTop : theme.size.normal,
        marginBottom: marginBottom !== undefined ? marginBottom : theme.size.normal,
        justifyContent: alignCenter ? 'center' : 'flex-start',
      }}
    />
  );
};

export default HeadlineSub;
