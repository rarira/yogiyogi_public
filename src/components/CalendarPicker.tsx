import addDays from 'date-fns/add_days';
import addHours from 'date-fns/add_hours';
import AndroidDivider from './AndroidDivider';
import format from 'date-fns/format';
import isAfter from 'date-fns/is_after';
import parse from 'date-fns/parse';
import React, { memo, Reducer, useCallback, useEffect, useMemo, useReducer } from 'react';
import roundToNearestMinutes from '../functions/roundToNearestMinutes';
import startOfDay from 'date-fns/start_of_day';
import startOfMonth from 'date-fns/start_of_month';
import styled from 'styled-components';

import { CalendarList, DateObject } from 'react-native-calendars';
import { DataTable } from 'react-native-paper';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { AppearanceType } from '../types/store';
import { getTheme, getThemeColor } from '../configs/theme';

const LocalConfig = require('../configs/calendarLocale');

const DataTableHeaderText = styled(Text)<{ isActive: boolean; theme: any }>`
  color: ${props => (!props.isActive ? props.theme.colors.focus : props.theme.colors.disabled)};
  font-weight: ${props => (!props.isActive ? 'bold' : 'normal')};
  font-size: ${props => props.theme.fontSize.normal}px;
`;

const DataTableRowText = styled(Text)<{ isActive: boolean; theme: any }>`
  color: ${props => (props.isActive ? props.theme.colors.text : props.theme.colors.disabled)};
  font-size: ${props => props.theme.fontSize.normal}px;
`;

interface Props {
  checked: boolean;
  initialCalendarPickerState: any;
  setCalendarPickerState: (arg: {
    dateStart: string;
    dateEnd: string;
    dateSelected: string;
    dateDispatch: (arg: {}) => void;
  }) => void;

  appearance: AppearanceType;
  //   React.SetStateAction<>
  // >;
}

const CalendarPicker = ({ checked, setCalendarPickerState, initialCalendarPickerState, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const initialState = initialCalendarPickerState;

  const reducer: Reducer<any, any> = (state, action) => {
    switch (action.type) {
      case 'setDateSelected': {
        return {
          // ...initialState,
          dateSelected: action.dateSelected,
          dateStart: '',
          dateEnd: '',
        };
      }
      case 'setDateEnd':
        return {
          dateStart: state.dateSelected,
          dateEnd: action.dateSelected,
          dateSelected: '',
        };
      case 'reSelect':
        return {
          dateStart: '',
          dateEnd: '',
          dateSelected: action.dateSelected,
        };
      case 'reset':
        return { dateStart: '', dateEnd: '', dateSelected: '' };
    }
  };
  const [dateState, dispatch] = useReducer(reducer, initialState);
  const { width } = Dimensions.get('window');

  const { dateStart, dateEnd, dateSelected } = dateState;

  // useEffect(() => {
  //   dispatch({ type: 'reset' });
  // }, [checked]);

  useEffect(() => {
    setCalendarPickerState({ dateStart, dateEnd, dateSelected, dateDispatch: dispatch });
  }, [dateStart, dateEnd, dateSelected]);

  const _handleOnDayPress = (day: DateObject) => {
    if (checked) {
      dispatch({ type: 'setDateSelected', dateSelected: day.dateString });
    } else if (dateStart && dateEnd && !dateSelected) {
      dispatch({ type: 'reSelect', dateSelected: day.dateString });
    } else if (!dateSelected) {
      dispatch({ type: 'setDateSelected', dateSelected: day.dateString });
    } else if (parse(dateSelected) > parse(day.dateString)) {
      dispatch({ type: 'setDateSelected', dateSelected: day.dateString });
    } else {
      dispatch({ type: 'setDateEnd', dateSelected: day.dateString });
    }
  };

  const createDateRange = useCallback(
    (dateStart: string, dateEnd: string, dateSelected: string, appearance: AppearanceType) => {
      const isSame = dateStart === dateEnd;

      const calendarSelectedTheme = {
        color: getThemeColor('accent', appearance),
        textColor: getThemeColor('background', appearance),
      };
      const dateRange = {
        [dateStart]: { startingDay: true, ...calendarSelectedTheme },
        [dateEnd]: { endingDay: true, startingDay: isSame, ...calendarSelectedTheme },
        [dateSelected]: { startingDay: true, endingDay: true, ...calendarSelectedTheme },
      };
      if (dateStart && dateEnd) {
        let start = addDays(parse(dateStart), 1);
        const end = startOfDay(parse(dateEnd));
        while (isAfter(end, start)) {
          Object.assign(dateRange, { [format(start, 'YYYY-MM-DD')]: { selected: true, ...calendarSelectedTheme } });
          start = addDays(start, 1);
        }
      }
      return dateRange;
    },
    [dateStart, dateEnd, dateSelected, appearance],
  );

  const minDate = roundToNearestMinutes(addHours(new Date(), 1), { nearestTo: 10 });

  const currentDate = useMemo(() => startOfMonth(parse(dateStart)), [dateStart]);
  const markedDateRange = useMemo(() => createDateRange(dateStart, dateEnd, dateSelected, appearance), [
    dateStart,
    dateEnd,
    dateSelected,
    appearance,
  ]);

  return (
    <>
      <View style={styles.containerWithShadow}>
        <CalendarList
          key={appearance}
          {...(dateStart && { current: currentDate })}
          style={styles.calendarListStyle}
          theme={{
            backgroundColor: theme.colors.background,
            calendarBackground: theme.colors.background,
            todayTextColor: theme.colors.focus,
            textDisabledColor: theme.colors.disabled,
            monthTextColor: theme.colors.text,
            dayTextColor: theme.colors.text,
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
          pastScrollRange={0}
          futureScrollRange={6}
          scrollEnabled={true}
          showScrollIndicator={true}
          calendarWidth={width - theme.size.big}
          onDayPress={_handleOnDayPress}
          markingType={'period'}
          minDate={minDate}
          markedDates={markedDateRange}
        />
      </View>

      {Platform.OS === 'android' && <AndroidDivider needMinusMarginHorizontal />}

      <DataTable style={styles.dataTableContainer}>
        <DataTable.Header style={styles.dataTableRow}>
          <DataTable.Title>
            <DataTableHeaderText isActive={dateSelected || dateStart} theme={theme}>
              시작일
            </DataTableHeaderText>
          </DataTable.Title>
          {!checked && (
            <DataTable.Title>
              <DataTableHeaderText isActive={!dateSelected} theme={theme}>
                종료일
              </DataTableHeaderText>
            </DataTable.Title>
          )}
        </DataTable.Header>

        <DataTable.Row style={styles.dataTableRow}>
          <DataTable.Cell>
            <DataTableRowText isActive={true} theme={theme}>
              {dateSelected || dateStart || '달력에서 선택하세요'}
            </DataTableRowText>
          </DataTable.Cell>
          {!checked && (
            <DataTable.Cell>
              <DataTableRowText isActive={dateSelected || dateEnd} theme={theme}>
                {dateEnd ? dateEnd : '달력에서 선택하세요'}
              </DataTableRowText>
            </DataTable.Cell>
          )}
        </DataTable.Row>
      </DataTable>
    </>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    containerWithShadow: {
      flex: 1,
      shadowColor: theme.colors.grey200,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.4,
      shadowRadius: 3,
      backgroundColor: theme.colors.background,
      // elevation: 4,
    },
    dataTableContainer: { marginHorizontal: theme.size.big, marginVertical: theme.size.normal },
    dataTableRow: { borderBottomWidth: 0, height: 30 },
    calendarListStyle: { alignSelf: 'center' },
  });

export default memo(CalendarPicker);
