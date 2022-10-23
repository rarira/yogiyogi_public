import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDateString, getTimeString } from '../../functions/getScheduleString';

import AndroidDivider from '../AndroidDivider';
import BookmarkButton from '../BookmarkButton';
import ClassActionMenuButton from '../ClassActionMenuButton';
import { ClassData } from '../../types/apiResults';
import { ClassStatusType } from '../../API';
import HeartButton from '../HeartButton';
import TabClassButton from './TabClassButton';
import { WarningProps } from '../WarningDialog';
import getClassStatus from '../../functions/getClassStatus';
import getTagString from '../../functions/getTagString';

import { AppearanceType } from '../../types/store';
import { getTheme } from '../../configs/theme';

interface Props extends NavigationInjectedProps {
  item: ClassData;
  setNeedAuthVisible?: (arg: boolean) => void;
  type: string;
  origin?: string;
  refetch?: any;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  isHost: boolean;
  appearance: AppearanceType;
}

const TabClassCard = ({
  item,
  navigation,
  setNeedAuthVisible,
  origin,
  type,
  refetch,
  setWarningProps,
  isHost,
  appearance,
}: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const { id, title, timeStart, dateStart, classStatus, host, center, regionSearchable, isLongTerm } = item;
  const dateStartString = getDateString(dateStart);
  const getStatus = getClassStatus(classStatus, appearance);
  const regionTagString = getTagString(regionSearchable);
  const timeStartString = getTimeString(timeStart);

  const _handleOnPress = () => navigation.navigate('ClassView', { classId: id, hostId: host.id, origin });

  const renderCardButtons = () => {
    const nowEpochSec = new Date().getTime() / 1000;

    return (
      <>
        <AndroidDivider needMarginVertical />
        <View style={styles.cardWrapper}>
          <View style={styles.flex1}>
            <TabClassButton
              classStatus={classStatus}
              hostId={host.id}
              hostName={host.name}
              id={id}
              isHost={isHost}
              timeStart={timeStart}
              appearance={appearance}
            />
          </View>
          {// (
          (type === 'hosted' ||
            //  &&
            //   !(
            //     // item!.classStatus === ClassStatusType.closed ||
            //     (item!.classStatus === ClassStatusType.cancelled && item!.timeStart! <= nowEpochSec)
            //   ))
            ((type === 'proxied' || type === 'toReview') &&
              (item!.classStatus === ClassStatusType.reviewed || item!.classStatus === ClassStatusType.proxied))) && (
            <ClassActionMenuButton
              classItem={item}
              setWarningProps={setWarningProps}
              refetch={refetch!}
              isHost={isHost}
              origin="ClassList"
            />
          )}
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={_handleOnPress}
        // onLayout={_handleOnLayout}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardInfoText}>{dateStartString.slice(0, 4)}</Text>
          <Text style={styles.cardLeftText}>{dateStartString.slice(-5)}</Text>
          <Text style={styles.cardInfoText}>{timeStartString}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitleText} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>

          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoText}>
              {center.name} @ {regionTagString}
            </Text>
          </View>
          <View style={styles.cardStatusRow}>
            <Text style={[styles.cardStatusText, { color: getStatus.color }]}>{getStatus.text}</Text>
            <Text style={styles.cardStatusText}>{isLongTerm ? '장기' : '단기'}</Text>
          </View>
        </View>
        <View style={styles.bookmarkButtonContainer}>
          <BookmarkButton setNeedAuthVisible={setNeedAuthVisible} classId={item.id} />
          <HeartButton item={item} setNeedAuthVisible={setNeedAuthVisible} />
        </View>
      </TouchableOpacity>
      {origin === 'ClassList' && renderCardButtons()}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      marginHorizontal: theme.size.big,
      borderColor: theme.colors.borderColor,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 10,
      borderRadius: 8,
      backgroundColor: theme.colors.cardBackground,
    },
    cardWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardLeft: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardLeftText: {
      fontSize: theme.fontSize.normal,
      color: theme.colors.text,
    },
    cardBody: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginHorizontal: theme.size.normal,
    },
    cardInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.size.xs,
    },
    cardStatusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cardInfoText: {
      color: theme.colors.backdrop,
      fontSize: theme.fontSize.small,
    },
    cardStatusText: {
      fontSize: theme.fontSize.small,
      fontWeight: '600',
      marginRight: theme.size.small,
      color: theme.colors.text,
    },
    cardTitleRow: {
      flexDirection: 'row',
      marginBottom: theme.size.xs,
    },
    cardTitleText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.normal,
    },
    cardSubtitleRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: theme.size.xs,
    },
    cardSubtitleText: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      color: theme.colors.backdrop,
      fontSize: theme.fontSize.small,
    },
    bookmarkButtonContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      // paddingRight: theme.size.normal,
    },
    disabledClassStatus: {
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      color: theme.colors.disabled,
      alignSelf: 'center',
    },
    flex1: {
      flex: 1,
    },
  });

export default memo(withNavigation(TabClassCard), (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.classStatus === next.item.classStatus &&
    prev.appearance === next.appearance
  );
});
