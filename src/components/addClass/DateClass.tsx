import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import React, { memo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AddClassHeader from './AddClassHeader';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import CalendarPicker from '../CalendarPicker';
import HeadlineSub from '../HeadlineSub';
import MyBanner from '../MyBanner';
import NextProcessButton from '../NextProcessButton';
import TabSelector from '../TabSelector';
import { WarningProps } from '../WarningDialog';

import { getDayOfWeek } from '../../functions/getDayOfWeek';
import { getCompStyles } from '../../configs/compStyles';

interface Props {
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setCancelVisible: (arg: boolean) => void;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;

  cancelVisible: boolean;
}

const DateClass = ({ cancelVisible, setCancelVisible, setWarningProps, snackbarDispatch }: Props) => {
  // const insets = useSafeArea();
  const {
    classStore,
    authStore: { appearance },
  } = useStoreState();

  const compStyles = getCompStyles(appearance);

  const [checked, setChecked] = useState(classStore.isLongTerm || false);
  const [bannerVisible, setBannerVisible] = useState(false);

  const initialCalendarPickerState = {
    // dateStart: '',
    // dateEnd: '',
    // dateSelected: '',
    dateStart: classStore.dateStart && classStore.dateEnd !== undefined ? classStore.dateStart : '',
    dateEnd: classStore.dateEnd ? classStore.dateEnd : '',
    dateSelected: classStore.dateEnd === undefined ? classStore.dateStart : '',
  };

  const [calendarPickerState, setCalendarPickerState] = useState({
    ...initialCalendarPickerState,
    dateDispatch: (arg: {}) => {},
  });
  const storeDispatch = useStoreDispatch();

  const { dateStart, dateEnd, dateSelected } = calendarPickerState;

  // console.log(calendarPickerState);
  // useEffect(() => {
  //   setCalendarPickerState({ ...initialCalendarPickerState, dateDispatch });
  // }, [checked]);

  const onPress = () => {
    const proceed = () => {
      const isClassPeriod = dateStart !== dateEnd;
      if ((!checked && !dateEnd) || (checked && !dateSelected)) {
        snackbarDispatch({
          type: OPEN_SNACKBAR,
          message: checked ? '시작일을 하루만 선택하세요' : '시작일과 종료일 모두 선택하세요',
        });
      } else {
        const addClassState = dateSelected ? 'dayClass' : isClassPeriod ? 'dayClass' : 'timeClass';
        storeDispatch({
          type: CHANGE_ADD_CLASS_STATE,
          addClassState,
          summary: classStore.summart,
          dateStart: dateStart || dateSelected,
          dateEnd: !checked && dateEnd ? dateEnd : undefined,
          isLongTerm: checked,
          ...(!isClassPeriod && { dayOfWeek: getDayOfWeek(checked ? dateSelected : dateStart) }),
        });
      }
    };
    if (classStore.summary) {
      setWarningProps!({
        dialogTitle: '스케쥴 수정',
        dialogContent: `스케쥴 수정을 계속하면 요일, 타임수, 시작/종료 시간 등이 초기화되어 재설정하셔야 합니다. 그래도 진행하시겠습니까?`,
        handleOk: proceed,
        okText: '예, 진행하겠습니다',
      });
    } else {
      proceed();
    }
  };

  return (
    <>
      <AddClassHeader
        bannerVisible={bannerVisible}
        backRoute="titleClass"
        cancelVisible={cancelVisible}
        setCancelVisible={setCancelVisible}
        summary={classStore.summary}
        pageCounterNumber={2}
      />
      <MyBanner
        message="매주 특정 요일에만 진행하는 클래스의 경우에도 기간으로 선택하시고 다음 화면에서 요일을 지정해 주세요"
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
          contentContainerStyle={[compStyles.scrollViewContainer, { ...(bannerVisible && compStyles.opacity01) }]}
        >
          <View style={compStyles.screenMarginHorizontal}>
            <HeadlineSub text="선생님이 담당할 클래스 진행 기간을 입력하세요" />
            <TabSelector
              tab1Label="단기"
              tab2Label="장기(종료일 미정)"
              checked={checked}
              setChecked={setChecked}
              appearance={appearance}
            />
          </View>
          <CalendarPicker
            checked={checked}
            setCalendarPickerState={setCalendarPickerState}
            initialCalendarPickerState={initialCalendarPickerState}
            appearance={appearance}
          />
          <NextProcessButton children={classStore.summary ? '수정 계속' : ''} onPress={onPress} />
        </ScrollView>
      </View>
    </>
  );
};

export default memo(DateClass);
