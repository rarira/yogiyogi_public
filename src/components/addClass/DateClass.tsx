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
          message: checked ? '???????????? ????????? ???????????????' : '???????????? ????????? ?????? ???????????????',
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
        dialogTitle: '????????? ??????',
        dialogContent: `????????? ????????? ???????????? ??????, ?????????, ??????/?????? ?????? ?????? ??????????????? ?????????????????? ?????????. ????????? ?????????????????????????`,
        handleOk: proceed,
        okText: '???, ?????????????????????',
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
        message="?????? ?????? ???????????? ???????????? ???????????? ???????????? ???????????? ??????????????? ?????? ???????????? ????????? ????????? ?????????"
        label1="???????????????"
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
            <HeadlineSub text="???????????? ????????? ????????? ?????? ????????? ???????????????" />
            <TabSelector
              tab1Label="??????"
              tab2Label="??????(????????? ??????)"
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
          <NextProcessButton children={classStore.summary ? '?????? ??????' : ''} onPress={onPress} />
        </ScrollView>
      </View>
    </>
  );
};

export default memo(DateClass);
