import * as Yup from 'yup';

import { Formik, FormikValues } from 'formik';
import { Keyboard, ScrollView, View } from 'react-native';
import getWeekdayArray, { WeekdayArrayObject } from '../../functions/getWeekdayArray';
import { memo, useEffect, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AddClassHeader from './AddClassHeader';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import DateDifferenceTable from '../DateDifferenceTable';
import FocusText from '../FocusText';
import HeadlineSub from '../HeadlineSub';
import MyBanner from '../MyBanner';
import NextProcessButton from '../NextProcessButton';
import React from 'react';
import RowInputField from '../RowInputField';

import { withNextInputAutoFocusForm } from 'react-native-formik';
import { getCompStyles } from '../../configs/compStyles';
import WeekDayPicker from '../WeekDayPicker';

interface Props {
  cancelVisible: boolean;
  setCancelVisible: (arg: boolean) => void;
}

const Form = withNextInputAutoFocusForm(View);

const DayClass = ({ cancelVisible, setCancelVisible }: Props) => {
  const [weekDayPicked, setWeekDayPicked] = useState<Array<string | undefined>>([]);
  const [weekdayArray, setWeekdayArray] = useState<WeekdayArrayObject[]>([]);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [focusBlur, setFocusBlur] = useState(false);

  const storeDispatch = useStoreDispatch();

  // * Production
  const {
    classStore: { dateStart, dateEnd, summary },
    authStore: { appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  // * 개발용;
  // const dateStart = '2019-05-13';
  // const dateEnd = '2019-05-17';

  useEffect(() => {
    let tempArray = getWeekdayArray(dateStart, dateEnd);
    setWeekdayArray(tempArray);
  }, [dateStart, dateEnd]);

  useEffect(() => {
    if (!dateEnd) {
      setBannerVisible(true);
    }
  }, [dateEnd]);

  const numOfSelectedWeekday = weekDayPicked.filter(weekday => weekday !== undefined).length;

  const validationSchema = Yup.object().shape({
    numOfClass: Yup.number()
      .required('필수 입력입니다')
      .integer('정수만 입력하세요')
      .positive('양수만 입력하세요')
      .moreThan(numOfSelectedWeekday - 1, '요일 수 이상 입력하세요'),
  });

  const handleSubmit = (values: FormikValues) => {
    Keyboard.dismiss();

    storeDispatch({
      type: CHANGE_ADD_CLASS_STATE,
      addClassState: 'timeClass',
      summary,
      dayOfWeek: weekDayPicked,
      numOfClass: Number(values.numOfClass),
    });
  };

  return (
    <>
      <AddClassHeader
        bannerVisible={bannerVisible}
        backRoute="dateClass"
        cancelVisible={cancelVisible}
        setCancelVisible={setCancelVisible}
        summary={summary}
        pageCounterNumber={2.5}
        needKeyboardDismissButton
      />

      <MyBanner
        message="종료일 미지정의 장기 클래스의 경우 총 클래스 타임수를 1주당 타임 기준으로 입력해 주시고 구체적인 내용은 이후의 추가 정보란에 기입해 주세요."
        label1="알겠습니다"
        visible={bannerVisible}
        setVisible={setBannerVisible}
      />
      <View
        style={[compStyles.flex1, { ...(bannerVisible && compStyles.opacity01) }]}
        {...(bannerVisible && { pointerEvents: 'none' })}
      >
        <ScrollView
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            compStyles.scrollViewContainer,
            compStyles.screenMarginHorizontal,
            { ...(bannerVisible && compStyles.opacity01) },
          ]}
        >
          <HeadlineSub
            marginBottom={0}
            text="선택한 기간 중 클래스가 열리는 요일을 선택하신 후 총 클래스 횟수를 입력하세요"
          />

          <DateDifferenceTable dateStart={dateStart} dateEnd={dateEnd} />

          <Formik
            validateOnChange={false}
            validateOnBlur={true}
            initialValues={{
              numOfClass: '2',
            }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {props => {
              return (
                <Form style={compStyles.form}>
                  <RowInputField
                    focusBlur={focusBlur}
                    setFocusBlur={setFocusBlur}
                    suffix={Boolean(dateEnd)}
                    name="numOfClass"
                    appearance={appearance}
                  />
                  <FocusText blur={!focusBlur} appearance={appearance}>
                    클래스 요일 선택
                  </FocusText>
                  {weekdayArray.length !== 0 && (
                    <WeekDayPicker
                      setWeekDayPicked={setWeekDayPicked}
                      weekdayArray={weekdayArray}
                      setFocusBlur={setFocusBlur}
                      unlimited={!dateEnd}
                      appearance={appearance}
                    />
                  )}

                  <View style={compStyles.flex1} />
                  <NextProcessButton
                    children={summary ? '수정 계속' : ''}
                    onPress={props.handleSubmit}
                    marginHorizontalNeedless
                    loading={props.isSubmitting || (props.isValidating && !props.errors)}
                  />
                </Form>
              );
            }}
          </Formik>
        </ScrollView>
      </View>
    </>
  );
};

export default memo(DayClass);
