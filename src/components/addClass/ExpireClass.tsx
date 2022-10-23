import { MySnackbarAction } from '../MySnackbar';
import { ScrollView, Text, View } from 'react-native';
import { memo, Reducer, useCallback, useEffect, useReducer, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AddClassHeader from './AddClassHeader';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import HeadlineSub from '../HeadlineSub';
import { RadioButton } from 'react-native-paper';

import NextProcessButton from '../NextProcessButton';
import React from 'react';
import { getCompStyles } from '../../configs/compStyles';
import { parse, getTime, addMonths, endOfMonth, format, endOfDay } from 'date-fns';
import { getTheme } from '../../configs/theme';
import { Calendar } from 'react-native-calendars';
import { ExpireType } from '../../types/store';
import KoreanParagraph from '../KoreanParagraph';
import koLocale from 'date-fns/locale/ko';
import { END_OF_DAY } from '../../configs/variables';

interface Props {
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setCancelVisible: (arg: boolean) => void;
}

const ExpireClass = ({ setCancelVisible }: Props) => {
  const {
    authStore,
    classStore: { timeStart, summary, dateStart, expireType, expiresAt },
  } = useStoreState();

  const storeDispatch = useStoreDispatch();
  const compStyles = getCompStyles(authStore.appearance);
  const theme = getTheme(authStore.appearance);

  const defaultDateSelected =
    !!expiresAt && expireType === ExpireType.SPECIFIC ? format(expiresAt * 1000, 'YYYY-MM-DD', { locale: koLocale }) : dateStart;
  const parsedTimeStart = parse(timeStart);
  const timeStartEpoch = Math.floor(getTime(parsedTimeStart) / 1000);
  const defaultExpireDate = expiresAt ?? timeStartEpoch;

  const initialState = {
    checked: expireType || ExpireType.TIMESTART,
    dateSelected: defaultDateSelected,
    expireDate: defaultExpireDate,
  };

  const reducer: Reducer<any, any> = (state, action) => {
    switch (action.type) {
      case ExpireType.TIMESTART: {
        return {
          ...state,
          checked: ExpireType.TIMESTART,
          expireDate: timeStartEpoch,
        };
      }
      case ExpireType.ENDLESS:
        return {
          ...state,
          checked: ExpireType.ENDLESS,
          expireDate: END_OF_DAY,
        };
      case ExpireType.SPECIFIC:
        return {
          ...state,
          checked: ExpireType.SPECIFIC,
          expireDate: Math.floor(getTime(endOfDay(state.dateSelected)) / 1000),
        };
      case 'selectDate': {
        return {
          checked: ExpireType.SPECIFIC,
          dateSelected: action.date,
          expireDate: Math.floor(getTime(endOfDay(action.date)) / 1000),
        };
      }
      default:
        return initialState;
    }
  };

  const [expireState, expireDispatch] = useReducer(reducer, initialState);

  const subHeadlineText = '구인 공고 마감 시한을 입력하세요. 기본값은 첫 수업 시작 시간이며, 별도의 날짜를 지정하실 수도 있습니다';

  const _handleOnPress = () => {
    storeDispatch({
      type: CHANGE_ADD_CLASS_STATE,
      addClassState: summary ? 'confirmClass' : 'myCenterClass',
      expiresAt: expireState.expireDate,
      expireType: expireState.checked,
    });
  };

  const _handleOnPressRadio = useCallback(
    (value: ExpireType) => () => {
      expireDispatch({
        type: value,
      });
    },
    [],
  );

  const selectedDateStyle = {
    selectedColor: theme.colors.accent,
    textColor: theme.colors.background,
  };
  const createMarkedDates = () => {
    if (expireState.dateSelected) {
      const markedDates = {
        [expireState.dateSelected]: { selected: true, ...selectedDateStyle },
      };
      return markedDates;
    }
  };

  const _handleSelectDay = (day: any) => {
    expireDispatch({
      type: 'selectDate',
      date: day.dateString,
    });
  };

  return (
    <>
      <AddClassHeader backRoute="timeClass" setCancelVisible={setCancelVisible} summary={summary} pageCounterNumber={4} />
      <ScrollView
        alwaysBounceVertical={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={compStyles.scrollViewContainer}
      >
        <View style={[compStyles.screenMarginHorizontal, compStyles.flex1]}>
          <HeadlineSub text={subHeadlineText} />
          <View style={compStyles.radioButtonItemm}>
            <RadioButton.Android
              value={ExpireType.TIMESTART}
              status={expireState.checked === ExpireType.TIMESTART ? 'checked' : 'unchecked'}
              onPress={_handleOnPressRadio(ExpireType.TIMESTART)}
              uncheckedColor={theme.colors.placeholder}
              color={theme.colors.accent}
            />
            <Text
              style={[compStyles.text, ...(expireState.checked === ExpireType.TIMESTART ? [{ color: theme.colors.accent, fontWeight: 'bold' }] : [])]}
            >
              (기본값) 첫 수업 시작 시간
            </Text>
          </View>
          {/* <View style={compStyles.radioButtonItemm}>
            <RadioButton.Android
              value={ExpireType.ENDLESS}
              status={expireState.checked === ExpireType.ENDLESS ? 'checked' : 'unchecked'}
              onPress={_handleOnPressRadio(ExpireType.ENDLESS)}
              uncheckedColor={theme.colors.placeholder}
              color={theme.colors.accent}
            />
            <Text
              style={[compStyles.text, ...(expireState.checked === ExpireType.ENDLESS ? [{ color: theme.colors.accent, fontWeight: 'bold' }] : [])]}
            >
              기한 제한 없음
            </Text>
          </View> */}
          <View style={compStyles.radioButtonItemm}>
            <RadioButton.Android
              value={ExpireType.SPECIFIC}
              status={expireState.checked === ExpireType.SPECIFIC ? 'checked' : 'unchecked'}
              onPress={_handleOnPressRadio(ExpireType.SPECIFIC)}
              uncheckedColor={theme.colors.placeholder}
              color={theme.colors.accent}
            />
            <Text
              style={[compStyles.text, ...(expireState.checked === ExpireType.SPECIFIC ? [{ color: theme.colors.accent, fontWeight: 'bold' }] : [])]}
            >
              날짜 지정 (최대 6개월)
            </Text>
          </View>
          {expireState.checked === ExpireType.SPECIFIC && (
            <View>
              <KoreanParagraph
                text="공고 마감 시한일을 선택하세요. 해당일 24시에 자동 '구인 완료' 됩니다."
                textStyle={compStyles.guideText}
                paragraphStyle={compStyles.guideContainer}
              />

              <Calendar
                key={authStore.appearance}
                current={defaultDateSelected}
                minDate={dateStart}
                maxDate={endOfMonth(addMonths(dateStart, 6))}
                onDayPress={_handleSelectDay}
                monthFormat={'yyyy MM'}
                hideExtraDays={true}
                onPressArrowLeft={substractMonth => substractMonth()}
                onPressArrowRight={addMonth => addMonth()}
                theme={{
                  backgroundColor: theme.colors.background,
                  calendarBackground: theme.colors.background,
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
          )}
        </View>

        <NextProcessButton children={summary ? '수정 완료' : ''} onPress={_handleOnPress} />
      </ScrollView>
    </>
  );
};
export default memo(ExpireClass);
