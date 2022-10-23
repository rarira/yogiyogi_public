import Carousel, { Pagination } from 'react-native-snap-carousel';
import React, { memo, useState } from 'react';
import { getThemeColor, normalize } from '../../configs/theme';

import HelpCarouselCard from './HelpCarouselCard';
import { StyleSheet } from 'react-native';
// import cardData from '../../static/data/cardData';
import getDimensions from '../../functions/getDimensions';
import { AppearanceType } from '../../types/store';
import getCardData from '../../static/data/cardData';
// import styles from '../../configs/styles';

interface Props {
  onCancel(): void;
  appearance: AppearanceType;
}

export type AddClassHelpCard = {
  title: string;
  desc1: string;
  desc2?: string;
  desc3?: string;
  desc4?: string;
  desc5?: string;
  img: any;
};

const { SCREEN_WIDTH } = getDimensions();

const HelpCarousel = ({ onCancel, appearance }: Props) => {
  const styles = getThemedStyles(appearance);
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderWidth = SCREEN_WIDTH * 0.8;
  const itemWidth = sliderWidth;
  const cardData = getCardData(appearance);
  const renderItem = ({ item, index }: { item: AddClassHelpCard; index: number }) => {
    return (
      <HelpCarouselCard
        item={item}
        itemWidth={itemWidth}
        index={index}
        {...(index === cardData.length - 1 && { onCancel })}
        appearance={appearance}
      />
    );
  };

  const _handleOnSnapToItem = (index: number) => setActiveSlide(index);

  return (
    <>
      <Carousel
        // layout="stack"
        layoutCardOffset={normalize(30)}
        data={cardData}
        renderItem={renderItem}
        sliderWidth={sliderWidth}
        itemWidth={itemWidth}
        slideStyle={styles.container}
        removeClippedSubviews={false}
        onSnapToItem={_handleOnSnapToItem}
      />
      <Pagination
        dotsLength={cardData.length}
        activeDotIndex={activeSlide}
        containerStyle={styles.paginationContainer}
        dotStyle={styles.dotStyle}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    </>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      // flexGrow: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      // height: 500,
    },
    paginationContainer: { backgroundColor: getThemeColor('background', appearance) },
    dotStyle: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 8,
      backgroundColor: getThemeColor('primary', appearance),
    },
  });

export default memo(HelpCarousel);
