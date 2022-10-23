import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { SatisfactionType } from '../../API';
import TextBox from '../TextBox';
import { AppearanceType } from '../../types/store';
import { getTheme } from '../../configs/theme';

interface Props {
  id: string;
  text: string;
  choosedManners: string[];
  setChoosedManners: (arg: string[]) => void;
  satisfactionState: SatisfactionType | null;
  appearance: AppearanceType;
}

const ReviewTextButton = ({ id, text, choosedManners, setChoosedManners, satisfactionState, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const [choosed, setChoosed] = useState(false);
  const color = !choosed
    ? theme.colors.backdrop
    : satisfactionState === SatisfactionType.bad
    ? theme.colors.error
    : theme.colors.primary;

  useEffect(() => {
    if (choosedManners.includes(id)) {
      setChoosed(true);
    } else {
      setChoosed(false);
    }
  }, [choosedManners]);

  const _handleOnPress = () => {
    let tempArray = [];
    if (choosed) {
      tempArray = choosedManners.filter(mannerId => mannerId !== id);
    } else {
      tempArray = choosedManners.concat([id]);
    }
    setChoosedManners(tempArray);
  };

  return (
    <TouchableOpacity onPress={_handleOnPress} style={styles.container}>
      <TextBox color={color} fontWeight={choosed ? 'bold' : 'normal'} text={text} appearance={appearance} />
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      // height: normalize(50),
      marginVertical: theme.size.small,
    },
  });
export default memo(ReviewTextButton);
