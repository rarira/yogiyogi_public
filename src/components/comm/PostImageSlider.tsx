import React, { memo, useEffect } from 'react';

import FastImage from 'react-native-fast-image';
import { S3Object } from '../../types/apiResults';
import { SliderBox } from 'react-native-image-slider-box';
import { StyleSheet } from 'react-native';
import asyncForEach from '../../functions/asyncForEach';
import getDimensions from '../../functions/getDimensions';
import getPublicS3Picture from '../../functions/getPublicS3Picture';
import isEqual from 'react-fast-compare';
import reportSentry from '../../functions/reportSentry';
import { getThemeColor } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

// import { useStoreState } from '../../stores/initStore';

interface Props {
  postPictures: S3Object[];
  imgURLs: string[];
  setImgURLs: (arg: string[]) => void;
  appearance: AppearanceType;
}

const { SCREEN_WIDTH } = getDimensions();
const PostImageSlider = ({ postPictures, imgURLs, setImgURLs, appearance }: Props) => {
  if (!postPictures || postPictures.length === 0) return null;

  const styles = getThemedStyles(appearance);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && !!postPictures && postPictures.length > 0) {
      (async function() {
        try {
          let temp: string[] = [];
          await asyncForEach(postPictures, async (obj: S3Object) => {
            const result = await getPublicS3Picture(obj.key);
            temp.push(result.toString());
          });
          setImgURLs(temp);
        } catch (e) {
          reportSentry(e);
        }
      })();
    }
    return () => {
      _mounted = false;
    };
  }, [postPictures]);

  // const dotColor = appearance === AppearanceType.LIGHT ?

  return (
    <SliderBox
      ImageComponent={FastImage}
      images={imgURLs}
      sliderBoxHeight={SCREEN_WIDTH}
      // onCurrentImagePressed={(index: number) => console.warn(`image ${index} pressed`)}
      dotColor={'#FFEE58'}
      inactiveDotColor={'#90A4AE'}
      paginationBoxVerticalPadding={20}
      // autoplay
      // circleLoop
      // resizeMethod={'resize'}
      // resizeMode={'cover'}
      paginationBoxStyle={styles.paginationBoxStyle}
      dotStyle={[styles.dotStyle]}
      // ImageComponentStyle={{ borderRadius: 15, width: '97%', marginTop: 5 }}
      imageLoadingColor={getThemeColor('focus', appearance)}
      inactiveSlideScale={1}
      inactiveSlideOpacity={1}
    />
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    paginationBoxStyle: {
      position: 'absolute',
      bottom: 0,
      padding: 0,
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'center',
    },
    dotStyle: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 0,
      padding: 0,
      margin: 0,
      backgroundColor: appearance === AppearanceType.LIGHT ? 'rgba(128, 128, 128, 0.92)' : 'rgba(128, 128, 128, 0.08)',
    },
  });

export default memo(PostImageSlider, isEqual);
