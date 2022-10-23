import { Ratings, S3Object } from '../../types/apiResults';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import { getTheme, normalize } from '../../configs/theme';

import Carousel from 'react-native-snap-carousel';
import UserThumbnail from '../UserThumbnail';
import getRatings from '../../functions/getRatings';

import { AppearanceType } from '../../types/store';

interface Props {
  source: string | S3Object | null;
  onPress?: () => void;
  xl?: boolean;
  hostSub: string;
  hostName: string;
  hostRatings: Ratings;
  headerVisible: boolean;
  appearance: AppearanceType;
}

export const RatingCircle = memo(
  ({
    ratingCircleSize,
    rating,
    ratingType,
    itemWidth,
    scoreTextStyle,
    typeTextStyle,
    appearance,
  }: {
    ratingCircleSize: number;
    rating: number;
    ratingType?: string;
    itemWidth: number;
    scoreTextStyle?: TextStyle;
    typeTextStyle?: TextStyle;
    appearance: AppearanceType;
  }) => {
    const theme = getTheme(appearance);
    const styles = getThemedStyles(theme);
    return (
      <View
        style={[
          {
            width: itemWidth,
            height: itemWidth + normalize(10),
          },
          styles.ratingCircleContainer,
        ]}
      >
        <View
          style={[
            {
              minWidth: ratingCircleSize,
              height: ratingCircleSize,
              borderRadius: ratingCircleSize / 2,
            },
            styles.ratingCircle,
            { ...(ratingType && { marginBottom: theme.size.xs }) },
          ]}
        >
          <Text style={[styles.ratingScoreText, scoreTextStyle]}>{rating}</Text>
        </View>
        {ratingType && <Text style={[styles.ratingTypeText, typeTextStyle]}>{ratingType}</Text>}
      </View>
    );
  },
  (prev, next) => prev.ratingType === next.ratingType,
);

const HostCarousel = ({ source, onPress, xl, hostSub, hostName, hostRatings, headerVisible, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const carouselEl = useRef<any>(null);
  const size = xl ? theme.iconSize.thumbnail : theme.iconSize.xl;
  const ratingCircleSize = size;
  const itemWidth = size + normalize(45);
  const sliderWidth = itemWidth * 3;
  const { hostRating, proxyRating } = useMemo(() => getRatings(hostRatings), [hostRatings]);

  useEffect(() => {
    if (!headerVisible) {
      carouselEl.current!.snapToItem(1);
    }
  }, [headerVisible]);

  const renderItem = ({ item, index }: { item: number; index: number }) => {
    if (index === 0) {
      return (
        <RatingCircle
          ratingCircleSize={ratingCircleSize}
          rating={proxyRating}
          ratingType="선생님 점수"
          itemWidth={itemWidth}
          appearance={appearance}
        />
      );
    }

    if (index === 1) {
      return (
        <View
          style={[
            {
              width: itemWidth,
              height: itemWidth + normalize(30),
            },
            styles.thumbnailContainer,
          ]}
        >
          <UserThumbnail
            source={source}
            identityId={hostSub}
            onPress={onPress}
            userName={hostName}
            userType="호스트"
            size={size}
            totalRating={hostRating + proxyRating}
          />
        </View>
      );
    }

    if (index === 2) {
      return (
        <RatingCircle
          ratingCircleSize={ratingCircleSize}
          rating={hostRating}
          ratingType="호스트 점수"
          itemWidth={itemWidth}
          appearance={appearance}
        />
      );
    }
  };
  return (
    <View style={[styles.carouselContainer, { height: itemWidth + normalize(20) }]}>
      <Carousel
        ref={carouselEl}
        data={[1, 2, 3]}
        itemWidth={itemWidth}
        sliderWidth={sliderWidth}
        firstItem={1}
        renderItem={renderItem}
        contentContainerCustomStyle={styles.carouselContentContainer}
        // enableMomentum

        // enableSnap
        inactiveSlideOpacity={0.3}
        inactiveSlideScale={0.5}
        useScrollView={true}
      />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    ratingCircleContainer: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    ratingScoreText: { color: theme.colors.text, fontSize: theme.fontSize.subheading, fontWeight: 'bold' },
    ratingTypeText: { color: theme.colors.background, fontWeight: '500', fontSize: theme.fontSize.small },
    ratingCircle: {
      backgroundColor: theme.colors.blue50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnailContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    carouselContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    carouselContentContainer: { alignItems: 'center', justifyContent: 'center' },
  });

export default memo(HostCarousel, (prev, next) => prev.source === next.source && prev.appearance === next.appearance);
