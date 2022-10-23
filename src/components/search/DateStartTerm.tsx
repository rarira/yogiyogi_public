import React, { memo, useState } from 'react';

import { Calendar } from 'react-native-calendars';
import { View } from 'react-native';
import addMonths from 'date-fns/add_months';

import endOfMonth from 'date-fns/end_of_month';

import ThemedButton from '../ThemedButton';
import { useStoreState } from '../../stores/initStore';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';

const LocalConfig = require('../../configs/calendarLocale');

interface Props {
  termDispatch: (arg: {}) => void;
  handleClose: () => void;
  dateStartTerm: string | null;
}

const DateStartTerm = ({ termDispatch, handleClose, dateStartTerm }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  const [dateSelected, setDateSelected] = useState(dateStartTerm);
  const today = new Date();

  const selectedDateStyle = {
    selectedColor: theme.colors.accent,
    textColor: theme.colors.background,
  };

  const createMarkedDates = () => {
    if (dateSelected) {
      const markedDates = {
        [dateSelected]: { selected: true, ...selectedDateStyle },
      };
      return markedDates;
    }
  };

  const _handleSetTerm = () => {
    termDispatch({ type: 'setTerm', dateStartTerm: dateSelected });
    handleClose();
  };

  const _handleSelectDay = (day: any) => {
    setDateSelected(day.dateString);
  };

  return (
    <View style={compStyles.searchContainer}>
      <View style={[compStyles.buttons, compStyles.searchTermButtons]}>
        <ThemedButton mode="text" compact color={theme.colors.accent} onPress={handleClose} style={compStyles.buttonMarginRight}>
          취소
        </ThemedButton>
        <ThemedButton mode="text" compact onPress={_handleSetTerm} disabled={!dateSelected}>
          선택한 날짜로 설정
        </ThemedButton>
      </View>
      <Calendar
        key={appearance}
        minDate={today}
        maxDate={endOfMonth(addMonths(today, 6))}
        onDayPress={_handleSelectDay}
        monthFormat={'yyyy MM'}
        hideExtraDays={true}
        onPressArrowLeft={substractMonth => substractMonth()}
        onPressArrowRight={addMonth => addMonth()}
        theme={{
          backgroundColor: theme.colors.uiBackground,
          calendarBackground: theme.colors.uiBackground,
          monthTextColor: theme.colors.text,
          todayTextColor: theme.colors.focus,
          textDisabledColor: theme.colors.disabled,
          dayTextColor: theme.colors.text,
          selectedDayTextColor: theme.colors.background,
          'stylesheet.day.period': {
            base: {
              overflow: 'hidden',
              height: 34,
              alignItems: 'center',
              width: 38,
            },
          },
          textDayFontSize: theme.fontSize.normal,
          textMonthFontSize: theme.fontSize.normal,
          textDayHeaderFontSize: theme.fontSize.normal,
        }}
        markedDates={createMarkedDates()}
      />
    </View>
  );
};

export default memo(DateStartTerm);
