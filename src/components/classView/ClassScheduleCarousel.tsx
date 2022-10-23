import React, { memo, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getCountdownTimer, getDateDurationString, getTimeString } from '../../functions/getScheduleString';

import Carousel from 'react-native-snap-carousel';
import { GetClassQuery } from '../../API';
import { getLocalizedWeekDayString } from '../../functions/getWeekdayArray';
import theme, { getTheme } from '../../configs/theme';
import styles from '../../configs/styles';
import { AppearanceType } from '../../types/store';

interface Props {
  data: Partial<GetClassQuery['getClass']>;
  blackText?: boolean;
  autoplay: boolean;
  appearance: AppearanceType;
}
interface ItemProps {
  type?: string;
  value: string;
  blackText?: boolean;
  appearance: AppearanceType;
}

const ItemContainer = memo(
  ({ type, value, blackText, appearance }: ItemProps) => {
    const theme = getTheme(appearance);
    const styles = getThemedStyles(theme);
    return (
      <View style={styles.itemContainer}>
        <Text style={[styles.valueText, { ...(blackText && { color: theme.colors.text }) }]}>{value}</Text>
        {type && <Text style={[styles.keyText, { ...(blackText && { color: theme.colors.text }) }]}>{type}</Text>}
      </View>
    );
  },
  (prev, next) => prev.value === next.value && prev.appearance === next.appearance,
);

const ClassScheduleCarousel = ({ data, blackText, autoplay, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const [activeSlide, setActiveSlide] = useState(0);
  const carouselEl = useRef<any>(null);
  const { dateStart, dateEnd, timeStart, timeEnd, dayOfWeek } = data!;
  const timeNow = new Date();

  const weekdayArray = useMemo(() => getLocalizedWeekDayString(dayOfWeek!), [dayOfWeek]);
  const durationString = useMemo(() => getDateDurationString(dateStart, dateEnd), [dateStart, dateEnd]);
  const countdownTimer = useMemo(() => getCountdownTimer(timeStart!, timeNow), [timeStart, timeNow]);
  const timeStartString = useMemo(() => getTimeString(timeStart!), [timeStart]);
  const timeEndString = useMemo(() => getTimeString(timeEnd!), [timeEnd]);

  const renderItem = ({ item }: { item: number }) => {
    if (item === 1) {
      return <ItemContainer value={durationString} blackText={blackText} appearance={appearance} />;
    }

    if (item === 4) {
      return (
        <ItemContainer
          type="구인 마감까지 남은 시간"
          value={countdownTimer}
          blackText={blackText}
          appearance={appearance}
        />
      );
    }

    if (item === 2) {
      return (
        <ItemContainer value={`${timeStartString} ~ ${timeEndString}`} blackText={blackText} appearance={appearance} />
      );
    }

    if (item === 3) {
      return <ItemContainer value={weekdayArray.toString()} blackText={blackText} appearance={appearance} />;
    }
  };

  const _handleOnSnapToItem = (index: number) => setActiveSlide(index);

  return (
    <View style={styles.carouselContainer}>
      <View style={styles.carouselPaginationContainer}>
        <Carousel
          ref={carouselEl}
          data={[1, 2, 3, 4]}
          itemWidth={210}
          sliderWidth={230}
          firstItem={activeSlide}
          renderItem={renderItem}
          contentContainerCustomStyle={styles.carouselContentContainer}
          enableSnap
          loop
          // lockScrollWhileSnapping={true}
          inactiveSlideOpacity={0}
          onSnapToItem={_handleOnSnapToItem}
          useScrollView={true}
          autoplay={autoplay}
          autoplayDelay={10}
          decelerationRate="fast"
          // enableMomentum={true}
          removeClippedSubviews={false}
        />
      </View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    ratingCircle: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    carouselContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 70,
      width: 240,
      marginHorizontal: theme.size.big,
    },
    carouselPaginationContainer: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    carouselContentContainer: { alignItems: 'center', justifyContent: 'center' },
    paginationContainer: { marginVertical: 4, paddingVertical: 0 },
    keyText: {
      color: theme.colors.background,
      fontWeight: '500',
      fontSize: theme.fontSize.medium,
      marginTop: theme.size.xs,
    },
    valueText: { color: theme.colors.background, fontWeight: '800', fontSize: theme.fontSize.normal },
    itemContainer: { flexDirection: 'column', alignItems: 'center' },
  });

export default memo(ClassScheduleCarousel);
