import Carousel, { Pagination } from 'react-native-snap-carousel';
import React, { memo, useState } from 'react';

import { AddClassHelpCard } from '../addClassHelp/HelpCarousel';
import { StyleSheet } from 'react-native';
import WelcomeCarouselCard from './WelcomeCarouselCard';
import getDimensions from '../../functions/getDimensions';
import { normalize } from '../../configs/theme';
import welcomeData from '../../static/data/welcomeData';

interface Props {
  onCancel(): void;
}

const { SCREEN_WIDTH } = getDimensions();

const WelcomeCarousel = ({ onCancel }: Props) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderWidth = SCREEN_WIDTH * 0.8;
  const itemWidth = sliderWidth;
  const renderItem = ({ item, index }: { item: AddClassHelpCard; index: number }) => {
    return (
      <WelcomeCarouselCard
        item={item}
        itemWidth={itemWidth}
        //TODO: Production 용 추후 이용
        {...(index === welcomeData.length - 1 && { onCancel })}
        //TODO: 테스트용
        // onCancel={onCancel}
      />
    );
  };

  const _handleOnSnapToItem = (index: number) => setActiveSlide(index);

  return (
    <>
      <Carousel
        // layout="stack"
        layoutCardOffset={normalize(30)}
        data={welcomeData}
        renderItem={renderItem}
        sliderWidth={sliderWidth}
        itemWidth={itemWidth}
        slideStyle={styles.container}
        // autoplay
        // autoplayDelay={3000}
        // autoplayInterval={5000}
        decelerationRate="fast"
        // enableMomentum
        useScrollView={true}
        lockScrollWhileSnapping
        enableSnap
        removeClippedSubviews={false}
        onSnapToItem={_handleOnSnapToItem}
      />
      <Pagination
        dotsLength={welcomeData.length}
        activeDotIndex={activeSlide}
        // containerStyle={styles.paginationContainer}
        dotStyle={styles.dotStyle}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // height: '100%',
  },
  dotStyle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
    backgroundColor: 'yellow',
  },
});

export default memo(WelcomeCarousel);
