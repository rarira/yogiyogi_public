import { CHANGE_ADD_CLASS_STATE, EDIT_FROM_SUMMARY, RESET_CLASS_STATE } from '../../stores/actionTypes';
import { Keyboard, ScrollView, Text, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AddClassButton from './AddClassButton';
import BackButton from '../BackButton';
import Body from '../Body';
import CancelButton from '../CancelButton';
import ClassSummaryDataTableHeader from '../ClassSummaryDataTableHeader';
import ClassSummaryDataTableRow from '../ClassSummaryDataTableRow';
import { DayType, ExpireType } from '../../types/store';
import HeaderTitle from '../HeaderTitle';
import HeadlineSub from '../HeadlineSub';
import ItemAfterCreateDialog from '../../functions/ItemAfterCreateDialog';
import Left from '../Left';
import { MySnackbarAction } from '../MySnackbar';
import { NavigationInjectedProps } from 'react-navigation';
import PageCounter from '../PageCounter';
import React from 'react';
import Right from '../Right';
import SwitchStackHeader from '../SwitchStackHeader';
import UpdateClassButton from './UpdateClassButton';

import format from 'date-fns/format';
import { initialWeekdayArray } from '../../functions/getWeekdayArray';
import parse from 'date-fns/parse';
import { withNavigation } from 'react-navigation';
import { getCompStyles } from '../../configs/compStyles';
import { getThemeColor } from '../../configs/theme';
import { TOTAL_ADD_CLASS_PAGE } from '../../configs/variables';
import koLocale from 'date-fns/locale/ko';

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
  cancelVisible: boolean;
  setCancelVisible: (arg: boolean) => void;
  origin?: string;
}

const numeral = require('numeral');

const ConfirmClass = ({ navigation, snackbarDispatch, cancelVisible, setCancelVisible, origin }: Props) => {
  // const [visible, setVisible] = useState(false);

  const storeDispatch = useStoreDispatch();

  //* 개발용 임시데이터
  const {
    classStore,
    authStore: {
      user: { username },
      appearance,
    },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  // const classStore: ClassStoreType = require('./tempData').default;
  const {
    id,
    title,
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    numOfClass,
    dayOfWeek,
    center,
    tags,
    classFee,
    memo,
    updateMode,
    expireType,
    expiresAt,
    // repostMode,
    confirmVisible,
    // updated,
    // isLongTerm,
  } = classStore;

  // console.log(classStore);
  const parsedTimeStart = parse(timeStart);
  const parsedTimeEnd = parse(timeEnd);

  const renderHeader = () => {
    const _handleOnBack = () =>
      storeDispatch({
        type: CHANGE_ADD_CLASS_STATE,
        addClassState: 'memoClass',
      });
    const _handleOnCancel = () => {
      Keyboard.dismiss();
      setCancelVisible(true);
    };
    return (
      <SwitchStackHeader appearance={appearance}>
        <Left>{!updateMode && <BackButton onPress={_handleOnBack} />}</Left>
        <Body>
          {updateMode ? (
            <HeaderTitle tintColor={getThemeColor('text', appearance)}>클래스 수정</HeaderTitle>
          ) : (
            <PageCounter pageNumber={9} totalPageNumber={TOTAL_ADD_CLASS_PAGE} />
          )}
        </Body>
        <Right>
          <CancelButton onPress={_handleOnCancel} />
        </Right>
      </SwitchStackHeader>
    );
  };

  const updateButton = (addClassState: string) => () => storeDispatch({ type: EDIT_FROM_SUMMARY, addClassState });

  const getSchedule = (
    dateStart: string,
    dateEnd: string | undefined,
    dayOfWeek: Array<DayType> | undefined,
    numOfClass: number,
    expireType: ExpireType,
    expiresAt: number,
  ) => {
    let weekdaySelected = '';
    if (dateStart !== dateEnd) {
      dayOfWeek!.forEach((weekday, index) => {
        if (weekday === initialWeekdayArray[index].value) {
          weekdaySelected = weekdaySelected.concat(`${initialWeekdayArray[index].local},`);
        }
      });
      const n = weekdaySelected.lastIndexOf(',');
      weekdaySelected = weekdaySelected.substr(0, n);
    }

    return (
      <>
        <Text style={compStyles.summaryText}>
          {dateStart === dateEnd ? '날짜' : '시작일'}: {dateStart}
        </Text>
        {dateStart !== dateEnd && (
          <>
            <Text style={compStyles.summaryText}>종료일: {dateEnd ? dateEnd : '미정'}</Text>
            <Text style={compStyles.summaryText}>요일: {weekdaySelected}</Text>
          </>
        )}
        <Text>{}</Text>
        <Text style={compStyles.summaryText}>타임수: {numOfClass}</Text>
        <Text>{}</Text>
        <Text style={compStyles.summaryText}>시작 시간: {format(parsedTimeStart, 'hh:mm A')}</Text>
        <Text style={compStyles.summaryText}>종료 시간: {format(parsedTimeEnd, 'hh:mm A')}</Text>
        <Text>{}</Text>
        <Text style={compStyles.summaryText}>
          구인 기한:{' '}
          {expireType === ExpireType.ENDLESS
            ? '무기한'
            : expireType === ExpireType.TIMESTART
            ? '시작 시간과 동일'
            : format(expiresAt * 1000, 'YYYY-MM-DD', { locale: koLocale })}
        </Text>
      </>
    );
  };

  const getTags = (tags: Array<string> | undefined) => {
    const string = JSON.stringify(tags).replace(/[\["\]]/g, '');
    return string ? string : '선택한 키워드 없음';
  };

  const stringifiedKeywordTags = getTags(tags);
  const _handleOnPress = () => {
    storeDispatch({ type: RESET_CLASS_STATE });
    if (origin) {
      navigation.navigate(origin, { classId: id });
    } else {
      navigation.navigate('Home');
    }
  };

  const _handleNavigateToClassView = () => {
    storeDispatch({ type: RESET_CLASS_STATE });
    navigation.navigate('ClassView', { classId: id, hostId: username, updated: updateMode ? 'updated' : 'added' });
  };

  const _handleOnDismiss = () => {
    storeDispatch({ type: CHANGE_ADD_CLASS_STATE, confirmVisible: false });
    // setVisible(false);
  };

  return (
    <>
      <View style={compStyles.flex1}>
        {renderHeader()}
        <View style={compStyles.screenMarginHorizontal}>
          <HeadlineSub
            marginBottom={0}
            text={
              updateMode
                ? '수정하실 항목을 선택하여 수정하신 후 아래 버튼을 터치하여 수정을 완료하세요'
                : '입력하신 내용을 아래에서 확인하신 후 클래스 등록 버튼을 터치하여 구인을 개시하세요'
            }
          />
        </View>

        <ScrollView
          bounces={false}
          alwaysBounceHorizontal={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[compStyles.screenMarginHorizontal, compStyles.normalVerticalPadding]}
          style={compStyles.flex1}
        >
          <ClassSummaryDataTableHeader appearance={appearance} />
          <ClassSummaryDataTableRow property="제목" value={title} onPress={updateButton('titleClass')} appearance={appearance} />
          <ClassSummaryDataTableRow
            property="스케쥴"
            value={getSchedule(dateStart, dateEnd, dayOfWeek, numOfClass, expireType, expiresAt)}
            onPress={updateButton('dateClass')}
            appearance={appearance}
          />

          <ClassSummaryDataTableRow property="센터" value={center!.name} onPress={updateButton('myCenterClass')} appearance={appearance} />
          <ClassSummaryDataTableRow property="키워드" value={stringifiedKeywordTags} onPress={updateButton('tagClass')} appearance={appearance} />
          <ClassSummaryDataTableRow
            property="수업료"
            value={`${numeral(classFee!).format('0,0')} 원/타임`}
            onPress={updateButton('classFeeClass')}
            appearance={appearance}
          />
          <ClassSummaryDataTableRow property="추가 정보" value={memo!} onPress={updateButton('memoClass')} appearance={appearance} />
        </ScrollView>
        {updateMode ? (
          <UpdateClassButton
            // setVisible={setVisible}
            cancelVisible={cancelVisible}
            snackbarDispatch={snackbarDispatch}
            stringifiedKeywordTags={stringifiedKeywordTags}
          />
        ) : (
          <AddClassButton
            // setVisible={setVisible}
            cancelVisible={cancelVisible}
            snackbarDispatch={snackbarDispatch}
            stringifiedKeywordTags={stringifiedKeywordTags}
          />
        )}
      </View>
      <ItemAfterCreateDialog
        itemName={'클래스'}
        suffix={'를'}
        dialogVisible={confirmVisible}
        updateMode={updateMode}
        handleCancelButton={_handleOnPress}
        handleOnDismiss={_handleOnDismiss}
        handleNavigation={_handleNavigateToClassView}
        appearance={appearance}
      />
    </>
  );
};

export default withNavigation(ConfirmClass);
