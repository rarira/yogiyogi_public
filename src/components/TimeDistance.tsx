import theme, { getThemeColor } from '../configs/theme';

import React from 'react';
import { Text } from 'react-native';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import koLocale from 'date-fns/locale/ko';
import { useStoreState } from '../stores/initStore';

interface Props {
  time: Date | string | number;
  fontSize?: number;
}

const TimeDistance = ({ time, fontSize }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const distanceWords = distanceInWordsToNow(time, { locale: koLocale, includeSeconds: true, addSuffix: true });

  return (
    <Text style={{ fontSize: fontSize || theme.fontSize.small, color: getThemeColor('backdrop', appearance) }}>
      {distanceWords}
    </Text>
  );
};

export default TimeDistance;
