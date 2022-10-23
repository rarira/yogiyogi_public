import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { Dispatch, Reducer, memo, useEffect, useReducer } from 'react';

import DatePicker from 'react-native-date-picker';
import addDays from 'date-fns/add_days';
import addHours from 'date-fns/add_hours';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import format from 'date-fns/format';
import isAfter from 'date-fns/is_after';
import isBefore from 'date-fns/is_before';
import isSameDay from 'date-fns/is_same_day';
import koLocale from 'date-fns/locale/ko';
import parse from 'date-fns/parse';
import roundToNearestMinutes from '../functions/roundToNearestMinutes';
import styled from 'styled-components';
import { getTheme } from '../configs/theme';
import { AppearanceType } from '../types/store';

interface Props {
  dateStart: string;
  setTimePeriodPickerState: Dispatch<
    React.SetStateAction<{
      timeStart: Date;
      timeEnd: Date;
      timeUpdated: boolean;
      timeDispatch: (arg: {}) => void;
    }>
  >;
  focusBlur: boolean;
  setFocusBlur: (arg: boolean) => void;
  initialTimePeriodPickerState: any;
  appearance: AppearanceType;
}

const TimeSelectorTouchableOpacity = styled(TouchableOpacity)<{ isTouched: boolean; theme: any }>`
  border-bottom-width: ${props => (props.isTouched ? 1 : 0)}px;
  border-bottom-color: ${props => (props.isTouched ? props.theme.colors.focus : 'transparent')};
`;

const TimeSelectorText = styled(Text)<{ isWaiting: boolean; isTouched: boolean; isUpdated: boolean; theme: any }>`
  color: ${props => {
    if (props.isTouched) return props.theme.colors.focus;
    if (props.isWaiting) return props.theme.colors.primary;
    if (props.isUpdated) return props.theme.colors.text;
    return props.theme.colors.disabled;
  }};
  font-size: ${props => props.theme.fontSize.subheading}px;
`;

const DurationText = styled(Text)<{ theme: any }>`
  font-size: ${props => props.theme.fontSize.normal}px;
  color: ${props => props.theme.colors.accent};
  align-self: center;
`;

const TimeSelectorContainer = styled(View)<{ theme: any }>`
  flex-direction: row;
  justify-content: space-around;
  padding: 0 ${props => props.theme.size.normal}px 0 ${props => props.theme.size.normal}px;
  margin: ${props => props.theme.size.normal}px 0 ${props => props.theme.size.normal}px 0;
`;

const TimePeriodPicker = ({
  dateStart,
  setTimePeriodPickerState,
  focusBlur,
  setFocusBlur,
  initialTimePeriodPickerState,
  appearance,
}: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const parsedDateStart = parse(dateStart);
  const now = new Date();
  const nearestMinFromNow = roundToNearestMinutes(addHours(now, 1), { nearestTo: 10 });
  const initialState = {
    ...initialTimePeriodPickerState,
    timeSelected:
      isSameDay(parsedDateStart, now) || isSameDay(parsedDateStart, nearestMinFromNow)
        ? nearestMinFromNow
        : parsedDateStart,
    timeStartTouched: false,
    timeEndTouched: false,
    timeStartUpdated: initialTimePeriodPickerState.timeUpdated ? true : false,
    timeEndUpdated: initialTimePeriodPickerState.timeUpdated ? true : false,
    timeStartEverClicked: false,
    timeEndEverClicked: false,
  };

  const reducer: Reducer<any, any> = (state, action) => {
    switch (action.type) {
      case 'timeSelected': {
        return {
          ...state,
          timeSelected: action.timeSelected,
        };
      }
      case 'setTimeStartTouched': {
        return {
          ...state,
          timeStartTouched: true,
          timeEndTouched: false,
          timeSelected: state.timeStart !== null ? state.timeStart : state.timeSelected,
          timeStart: !timeStartUpdated ? state.timeSelected : state.timeStart,
          timeStartUpdated: true,
          timeStartEverTouched: true,
        };
      }
      case 'setTimeEndTouched': {
        return {
          ...state,
          timeEndTouched: true,
          timeStartTouched: false,
          timeSelected: state.timeEnd !== null ? state.timeEnd : state.timeSelected,
          timeEnd: !timeEndUpdated ? state.timeSelected : state.timeEnd,
          timeEndUpdated: true,
          timeEndEverTouched: true,
        };
      }
      case 'setTimeStart':
        return {
          ...state,
          timeStart: action.timeStart,
          timeStartUpdated: true,
          timeEnd:
            state.timeEnd !== null && isAfter(state.timeEnd, action.timeStart)
              ? state.timeEnd
              : addHours(action.timeStart, 1),
          timeEndUpdated:
            state.timeEnd !== null && isAfter(state.timeEnd, action.timeStart) ? state.timeEndUpdated : true,
        };
      case 'setTimeEnd':
        return {
          ...state,
          timeEnd: action.timeEnd,
          setTimeEndUpdated: true,
          timeStart:
            state.timeStart !== null && isAfter(action.timeEnd, state.timeStart)
              ? state.timeStart
              : addHours(action.timeEnd, -1),
          timeStartUpdated:
            state.timeStart !== null && isAfter(action.timeEnd, state.timeStart) ? state.timeStartUpdated : true,
        };
      case 'wrongInput':
        return {
          ...state,
          timeEndUpdated: false,
        };
      case 'focusedOut':
        return {
          ...state,
          timeStartTouched: false,
          timeEndTouched: false,
        };
      case 'reset':
        return initialState;
    }
  };

  const [timeState, dispatch] = useReducer(reducer, initialState);
  const {
    timeSelected,
    timeStart,
    timeEnd,
    timeStartTouched,
    timeEndTouched,
    timeStartEverTouched,
    timeEndEverTouched,
    timeStartUpdated,
    timeEndUpdated,
  } = timeState;
  const formattedTimeStart = format(timeStart, 'A hh:mm', { locale: koLocale });
  const formattedTimeEnd = format(timeEnd, 'A hh:mm', { locale: koLocale });

  useEffect(() => {
    if (timeStartTouched) {
      if (timeSelected <= addHours(now, 1)) {
        Alert.alert('현재 시간보다 최소 1시간 이후로 선택해 주세요');
      } else {
        dispatch({ type: 'setTimeStart', timeStart: timeSelected });
      }
    } else if (timeEndTouched) {
      dispatch({ type: 'setTimeEnd', timeEnd: timeSelected });
    }
  }, [timeSelected]);

  useEffect(() => {
    setTimePeriodPickerState({
      timeStart,
      timeEnd,
      timeUpdated: timeStartUpdated && timeEndUpdated,
      timeDispatch: dispatch,
    });
  }, [timeStart, timeEnd, dispatch, timeStartUpdated, timeEndUpdated]);

  useEffect(() => {
    if (!focusBlur) {
      dispatch({ type: 'focusedOut' });
    }
  }, [focusBlur]);

  const _handleOnTimeChange = (date: any) => {
    if (timeEndTouched && !isBefore(timeStart, date)) {
      Alert.alert('종료 시간을 시작 시간 뒤로 설정하세요');
      dispatch({ type: 'timeSelected', timeSelected });
    } else {
      const newDate = isAfter(date, addDays(parsedDateStart, 1))
        ? addDays(date, -1)
        : isAfter(parsedDateStart, date)
        ? addDays(date, +1)
        : date;
      dispatch({ type: 'timeSelected', timeSelected: newDate });
    }
  };

  const _handleTimeStartTouched = () => {
    dispatch({ type: 'setTimeStartTouched' });
    if (!focusBlur) {
      Keyboard.dismiss();
      setFocusBlur(true);
    }
  };
  const _handleTimeEndTouched = () => {
    dispatch({ type: 'setTimeEndTouched' });
    if (!focusBlur) {
      Keyboard.dismiss();
      setFocusBlur(true);
    }
  };
  return (
    <>
      <TimeSelectorContainer theme={theme}>
        <TimeSelectorTouchableOpacity
          onPress={_handleTimeStartTouched}
          hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
          isTouched={timeStartTouched}
          theme={theme}
        >
          <TimeSelectorText
            isWaiting={!timeStartEverTouched}
            isTouched={timeStartTouched}
            isUpdated={timeStartUpdated}
            theme={theme}
          >
            {!timeStartUpdated ? '시작 시간 선택' : formattedTimeStart}
          </TimeSelectorText>
        </TimeSelectorTouchableOpacity>
        <Text style={styles.durationMarker}></Text>
        <TimeSelectorTouchableOpacity
          hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
          onPress={_handleTimeEndTouched}
          isTouched={timeEndTouched}
          theme={theme}
        >
          <TimeSelectorText
            isWaiting={!timeEndEverTouched}
            isTouched={timeEndTouched}
            isUpdated={timeEndUpdated}
            theme={theme}
          >
            {!timeEndUpdated ? '종료 시간 선택' : formattedTimeEnd}
          </TimeSelectorText>
        </TimeSelectorTouchableOpacity>
      </TimeSelectorContainer>
      {(timeStartTouched || timeEndTouched) && (
        <DatePicker
          mode="time"
          locale="ko-KR"
          minuteInterval={10}
          date={timeStartTouched ? timeStart : timeEndTouched ? timeEnd : null}
          onDateChange={_handleOnTimeChange}
          textColor={theme.colors.text}
        />
      )}

      {timeStartUpdated && timeEndUpdated && (
        <DurationText theme={theme}>{differenceInMinutes(timeEnd, timeStart)}분/타임</DurationText>
      )}
    </>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    durationMarker: { fontSize: theme.fontSize.subheading, color: theme.colors.text },
  });

export default memo(TimePeriodPicker);
