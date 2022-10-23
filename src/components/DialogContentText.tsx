import KoreanParagraph from './KoreanParagraph';
import React from 'react';
import { getTheme } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

interface Props {
  text: string;
  bold?: boolean;
  warning?: boolean;
}

const DialogContentText = ({ text, bold, warning }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const theme = getTheme(appearance);

  return (
    <KoreanParagraph
      text={text}
      textStyle={{
        fontSize: theme.fontSize.medium,
        color: warning ? theme.colors.accent : theme.colors.placeholder,
        fontWeight: bold ? 'bold' : 'normal',
      }}
      paragraphStyle={{ marginBottom: theme.size.xs }}
    />
  );
};
export default DialogContentText;
