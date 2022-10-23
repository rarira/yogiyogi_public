import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import AD_IDS from '../../static/data/AD_IDS';
import ClassCard from './ClassCard';
import { ClassData } from '../../types/apiResults';
import MyBannerAd from '../Ad/MyBannerAd';
import { SEARCH_RESULTS_BANNER_AD_POSSIBILITY } from '../../configs/variables';
import { AppearanceType } from '../../types/store';

interface Props {
  item: ClassData;
  index: number;
  origin: string;
  setNeedAuthVisible(arg: boolean): void;
  appearance: AppearanceType;
}

const SearchResultsRenderItem = ({ item, index, origin, setNeedAuthVisible, appearance }: Props) => {
  // const randomNumber = Math.random();
  // const withAd: boolean = randomNumber < SEARCH_RESULTS_BANNER_AD_POSSIBILITY;
  return (
    <View style={styles.itemConatiner}>
      <ClassCard item={item} setNeedAuthVisible={setNeedAuthVisible} origin={origin} appearance={appearance} />
      {index % SEARCH_RESULTS_BANNER_AD_POSSIBILITY === 2 && (
        <MyBannerAd advId={AD_IDS.SearchResultsBanner} needMarginTop />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemConatiner: { flexDirection: 'column' },
});

export default memo(SearchResultsRenderItem);
