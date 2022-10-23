import React, { useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { getTheme } from '../configs/theme';

import { WeekdayArrayObject } from '../functions/getWeekdayArray';
import { AppearanceType } from '../types/store';

interface Props {
  setWeekDayPicked: (arg: (string | undefined)[]) => void;
  weekdayArray: WeekdayArrayObject[];
  setFocusBlur: (arg: boolean) => void;
  unlimited?: boolean;
  appearance: AppearanceType;
}

interface DayArray {
  state: boolean;
  setState: (arg: boolean) => void;
}

const WeekDayPicker = ({ setWeekDayPicked, weekdayArray, setFocusBlur, unlimited, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const [sunChecked, setSunChecked] = useState(false);
  const [monChecked, setMonChecked] = useState(false);
  const [tueChecked, setTueChecked] = useState(false);
  const [wedChecked, setWedChecked] = useState(false);
  const [thuChecked, setThuChecked] = useState(false);
  const [friChecked, setFriChecked] = useState(false);
  const [satChecked, setSatChecked] = useState(false);
  // const [modifiedDayArray, setModifiedDayArray] = useState<Array<DayArray & WeekdayArrayObject>>([]);

  const dayArray = [
    { state: sunChecked, setState: setSunChecked },
    { state: monChecked, setState: setMonChecked },
    { state: tueChecked, setState: setTueChecked },
    { state: wedChecked, setState: setWedChecked },
    { state: thuChecked, setState: setThuChecked },
    { state: friChecked, setState: setFriChecked },
    { state: satChecked, setState: setSatChecked },
  ];

  let modifiedArray: Array<DayArray & WeekdayArrayObject> = [];

  for (let i = 0; i < 7; i++) {
    modifiedArray[i] = Object.assign({}, dayArray[i], weekdayArray[i]);
  }

  useEffect(() => {
    const weekDayPicked = modifiedArray.map(({ state, isStart, isEnd, value }) => {
      if (state || isStart || isEnd) return value;
    });

    setWeekDayPicked(weekDayPicked);
  }, [sunChecked, monChecked, tueChecked, wedChecked, thuChecked, friChecked, satChecked]);

  return (
    <View style={styles.container}>
      {modifiedArray.map(({ state, setState, value, local, date, isStart, isEnd }) => {
        const disabled = !unlimited && date.length === 0;
        return (
          <View style={styles.weekday} key={value}>
            <Text
              style={{
                color: disabled
                  ? theme.colors.disabled
                  : state || isStart || isEnd
                  ? theme.colors.accent
                  : theme.colors.placeholder,
              }}
            >
              {local}
            </Text>
            {disabled ? (
              <View style={styles.disabledRadio} />
            ) : (
              <View style={styles.radioButtonContainer}>
                <RadioButton.Android
                  value={value}
                  status={state || isStart || isEnd ? 'checked' : 'unchecked'}
                  onPress={() => {
                    Keyboard.dismiss();
                    setFocusBlur(true);
                    setState(!state);
                  }}
                  uncheckedColor={theme.colors.placeholder}
                  color={theme.colors.accent}
                  disabled={disabled}
                />
                {isStart && <Text style={styles.startEndText}>시작요일</Text>}
                {isEnd && <Text style={styles.startEndText}>종료요일</Text>}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginVertical: theme.size.small,
    },
    weekday: { flexDirection: 'column', alignItems: 'center' },
    disabledRadio: {
      height: 20,
      width: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.disabled,
      margin: 8,
    },
    startEndText: { fontSize: theme.fontSize.xs, color: theme.colors.backdrop },
    radioButtonContainer: { flexDirection: 'column', alignItems: 'center' },
  });

export default memo(WeekDayPicker);
