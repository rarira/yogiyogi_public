import { LayoutChangeEvent, Text, View } from 'react-native';
import React, { memo, useMemo } from 'react';
import { getDateDurationString, getTimeString } from '../../functions/getScheduleString';

import BlockedKoreanParagraph from '../BlockedKoreanParagraph';
import ClassFeeTable from '../ClassFeeTable';
import ClassViewCenterInfo from './ClassViewCenterInfo';
import ClassViewTerm from './ClassViewTerm';
import { GetClassQuery } from '../../API';
import ImageCopyright from '../ImageCopyright';
import KoreanParagraph from '../KoreanParagraph';
import MyDivider from '../MyDivider';
import SubHeaderText from '../SubHeaderText';
import { WarningProps } from '../WarningDialog';
import { getLocalizedWeekDayString } from '../../functions/getWeekdayArray';
import { getStyles } from '../../configs/styles';
import getTagString from '../../functions/getTagString';
import getUsername from '../../functions/getUsername';
import { useStoreState } from '../../stores/initStore';
import { AppearanceType } from '../../types/store';

interface Props {
  item: Partial<GetClassQuery['getClass']>;
  setCenterInfoY: (arg: number) => void;
  setScheduleInfoY: (arg: number) => void;
  isHost: boolean;
  isAdminPost: boolean;
  bgCopyright: string;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  setModalVisible: (arg: boolean) => void;
  appearance: AppearanceType;
}

const ClassViewContent = ({
  item,
  setCenterInfoY,
  setScheduleInfoY,
  isHost,
  isAdminPost,
  bgCopyright,
  setWarningProps,
  setModalVisible,
  appearance,
}: Props) => {
  const {
    id,
    host,
    memo,
    numOfClass,
    classFee,
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    dayOfWeek,
    tagSearchable,
    extraInfo,
    isLongTerm,
  } = item!;

  const styles = getStyles(appearance);
  const modifiedTagSearchable = useMemo(() => getTagString(tagSearchable?.replace(/,/g, ', ')), [tagSearchable]);
  const durationString = useMemo(() => getDateDurationString(dateStart, dateEnd), [dateStart, dateEnd]);
  const timeStartString = useMemo(() => getTimeString(timeStart!), [timeStart]);
  const timeEndString = useMemo(() => getTimeString(timeEnd!), [timeEnd]);
  const weekDayString = useMemo(() => getLocalizedWeekDayString(dayOfWeek!).toString(), [dayOfWeek]);

  const _handleCenterInfoOnLayout = (ev: LayoutChangeEvent) => setCenterInfoY(ev.nativeEvent.layout.y);
  const _handleScheduleInfoOnLayout = (ev: LayoutChangeEvent) => setScheduleInfoY(ev.nativeEvent.layout.y);

  return (
    <View style={styles.classViewContentContainer}>
      <ClassFeeTable numOfClass={numOfClass!} classFee={classFee} isLongTerm={isLongTerm!} appearance={appearance} />
      <MyDivider appearance={appearance} />
      <View
        style={[styles.screenMarginHorizontal, styles.paddingMediumVertical]}
        onLayout={_handleScheduleInfoOnLayout}
      >
        <SubHeaderText needMarginBottom appearance={appearance}>
          날짜/시간
        </SubHeaderText>
        <Text style={styles.fontMedium}>날짜 : {durationString}</Text>
        <Text style={[styles.smallVerticalMargin, styles.fontMedium]}>
          시간 : {timeStartString} ~ {timeEndString}
        </Text>
        <Text style={styles.fontMedium}>요일 : {weekDayString}</Text>
      </View>
      <MyDivider appearance={appearance} />
      {modifiedTagSearchable && (
        <>
          <View style={[styles.screenMarginHorizontal, styles.paddingMediumVertical]}>
            <SubHeaderText needMarginBottom appearance={appearance}>
              등록 키워드
            </SubHeaderText>
            <KoreanParagraph text={modifiedTagSearchable} textStyle={styles.fontMedium} />
          </View>
          <MyDivider appearance={appearance} />
        </>
      )}

      {memo && (
        <>
          <View style={[styles.screenMarginHorizontal, styles.paddingMediumVertical]}>
            <SubHeaderText appearance={appearance}>추가 정보</SubHeaderText>
            <BlockedKoreanParagraph text={memo} />
          </View>
          <MyDivider appearance={appearance} />
        </>
      )}

      <View style={[styles.screenMarginHorizontal, styles.paddingMediumVertical]} onLayout={_handleCenterInfoOnLayout}>
        <SubHeaderText appearance={appearance} needMarginBottom>
          센터 정보
        </SubHeaderText>
        <ClassViewCenterInfo item={item} isAdminPost={isAdminPost} appearance={appearance} />
      </View>
      <MyDivider appearance={appearance} />
      <View style={[styles.screenMarginHorizontal, styles.paddingMediumVertical]}>
        <ClassViewTerm
          host={isAdminPost ? extraInfo?.centerName ?? '' : getUsername(host!.id, host!.name)}
          classId={id!}
          isHost={isHost}
          setWarningProps={setWarningProps}
          setModalVisible={setModalVisible}
        />
      </View>
      <ImageCopyright copyright={bgCopyright} appearance={appearance} />
    </View>
  );
};

export default memo(ClassViewContent);
