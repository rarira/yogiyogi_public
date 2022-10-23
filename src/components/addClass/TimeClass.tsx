import * as Yup from 'yup';

import { Formik, FormikValues } from 'formik';
import { Keyboard, ScrollView, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { memo, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AddClassHeader from './AddClassHeader';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import HeadlineSub from '../HeadlineSub';
import MyBanner from '../MyBanner';
import NextProcessButton from '../NextProcessButton';
import React from 'react';
import RowInputField from '../RowInputField';
import TimePeriodPicker from '../TimePeriodPicker';

import format from 'date-fns/format';
import isAfter from 'date-fns/is_after';
import isSameDay from 'date-fns/is_same_day';
import parse from 'date-fns/parse';
import { withNextInputAutoFocusForm } from 'react-native-formik';
import { getCompStyles } from '../../configs/compStyles';

interface Props {
  snackbarDispatch: (arg: MySnackbarAction) => void;
  cancelVisible: boolean;
  setCancelVisible: (arg: boolean) => void;
}

const Form = withNextInputAutoFocusForm(View);

const validationSchema = Yup.object().shape({
  numOfClass: Yup.number()
    .required('필수 입력입니다')
    .integer('정수만 입력하세요')
    .positive('양수만 입력하세요')
    .moreThan(0, '1이상 입력하세요'),
});

const TimeClass = ({ cancelVisible, setCancelVisible, snackbarDispatch }: Props) => {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [focusBlur, setFocusBlur] = useState(false);
  const {
    classStore,
    authStore: { appearance },
  } = useStoreState();
  const { dateStart, dateEnd, numOfClass, summary } = classStore;
  const storeDispatch = useStoreDispatch();
  const dateNotUpdated = isSameDay(parse(dateStart), parse(classStore.timeStart));
  const compStyles = getCompStyles(appearance);

  const initialTimePeriodPickerState = {
    timeStart: classStore.timeStart && dateNotUpdated ? new Date(classStore.timeStart) : parse(dateStart),
    timeEnd: classStore.timeEnd && dateNotUpdated ? new Date(classStore.timeEnd) : parse(dateStart),
    timeUpdated: classStore.timeStart && dateNotUpdated ? true : false,
  };
  const [timePeriodPickerState, setTimePeriodPickerState] = useState({
    ...initialTimePeriodPickerState,
    timeDispatch: (arg: any) => {},
  });

  const { timeStart, timeEnd, timeDispatch, timeUpdated } = timePeriodPickerState;
  const isClassPeriod = dateStart !== dateEnd;

  const handleSubmit = (values: FormikValues) => {
    Keyboard.dismiss();
    if (!timeUpdated) {
      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: '시작 시간과 종료 시간 모두 선택해 주세요',
      });
    } else if (!isAfter(timeEnd, timeStart)) {
      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: '종료 시간은 시작 시간 이후여야 합니다',
        sideEffect: () =>
          timeDispatch({
            type: 'wrongInput',
          }),
      });
    } else {
      storeDispatch({
        type: CHANGE_ADD_CLASS_STATE,
        addClassState: 'expireClass',
        timeStart: format(timeStart, 'YYYY-MM-DDTHH:mm:ssZ'),
        timeEnd: format(timeEnd, 'YYYY-MM-DDTHH:mm:ssZ'),
        numOfClass: !isClassPeriod ? Number(values.numOfClass) : numOfClass,
      });
    }
  };

  return (
    <>
      <AddClassHeader
        bannerVisible={bannerVisible}
        backRoute={isClassPeriod ? 'dayClass' : 'dateClass'}
        cancelVisible={cancelVisible}
        setCancelVisible={setCancelVisible}
        summary={summary}
        pageCounterNumber={3}
        needKeyboardDismissButton
      />

      <MyBanner
        message={`클래스 시간은 '최초 수업일'의 연결된 "첫 수업 시작" 부터 "마지막 수업 종료" 시간까지로 작성하시고 타임별 시간 등 구체적인 내용은 이후의 추가 정보란에 기입해 주세요.`}
        label1="알겠습니다"
        visible={bannerVisible}
        setVisible={setBannerVisible}
      />
      <View style={[compStyles.flex1, { ...(bannerVisible && compStyles.opacity01) }]} {...(bannerVisible && { pointerEvents: 'none' })}>
        <ScrollView
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[compStyles.scrollViewContainer, { ...(bannerVisible && compStyles.opacity01) }]}
        >
          <View style={compStyles.screenMarginHorizontal}>
            <HeadlineSub text="클래스 시간을 입력하세요" />
          </View>

          <Formik
            validateOnChange={false}
            validateOnBlur={true}
            initialValues={{
              numOfClass: '1',
            }}
            onSubmit={values => handleSubmit(values)}
            validationSchema={validationSchema}
          >
            {props => {
              return (
                <Form style={compStyles.form}>
                  <View style={[compStyles.focusContainer, compStyles.screenMarginHorizontal]}>
                    {!isClassPeriod && (
                      <RowInputField focusBlur={focusBlur} setFocusBlur={setFocusBlur} suffix={dateEnd} name="numOfClass" appearance={appearance} />
                    )}

                    <TimePeriodPicker
                      dateStart={dateStart}
                      setTimePeriodPickerState={setTimePeriodPickerState}
                      focusBlur={focusBlur}
                      setFocusBlur={setFocusBlur}
                      initialTimePeriodPickerState={initialTimePeriodPickerState}
                      appearance={appearance}
                    />
                  </View>
                  <View style={compStyles.flex1} />

                  <NextProcessButton
                    children={summary ? '수정 계속' : ''}
                    onPress={props.handleSubmit}
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

export default memo(TimeClass);
