import React, { memo, useState } from 'react';

import DatePicker from 'react-native-date-picker';
import { View } from 'react-native';
import addDays from 'date-fns/add_days';

import isAfter from 'date-fns/is_after';
import parse from 'date-fns/parse';
import startOfDay from 'date-fns/start_of_day';

import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  termDispatch: (arg: {}) => void;
  handleClose: () => void;
  timeStartTerm: string | null;
  appearance: AppearanceType;
}

const TimeStartTerm = ({ termDispatch, handleClose, timeStartTerm, appearance }: Props) => {
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  const [timeSelected, setTimeSelected] = useState(timeStartTerm ? parse(timeStartTerm) : null);

  const _handleSetTerm = () => {
    termDispatch({ type: 'setTerm', timeStartTerm: timeSelected });
    handleClose();
  };

  const _handleOnTimeChage = (date: any) => {
    const today = startOfDay(new Date());

    const newDate = isAfter(date, addDays(today, 1))
      ? addDays(date, -1)
      : isAfter(today, date)
      ? addDays(date, +1)
      : date;
    setTimeSelected(newDate);
  };

  return (
    <View style={compStyles.searchContainer}>
      <View style={[compStyles.buttons, compStyles.searchTermButtons]}>
        <ThemedButton
          mode="text"
          compact
          color={theme.colors.accent}
          onPress={handleClose}
          style={compStyles.buttonMarginRight}
        >
          취소
        </ThemedButton>
        <ThemedButton mode="text" compact onPress={_handleSetTerm} disabled={!timeSelected}>
          선택한 시간으로 설정
        </ThemedButton>
      </View>
      <View style={compStyles.pickerContainer}>
        <DatePicker
          date={timeSelected || new Date()}
          onDateChange={_handleOnTimeChage}
          mode="time"
          minuteInterval={10}
          locale="ko-KR"
          textColor={theme.colors.text}
        />
      </View>
    </View>
  );
};

export default memo(TimeStartTerm);
