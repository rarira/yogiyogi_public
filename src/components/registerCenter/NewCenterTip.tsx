import React, { memo } from 'react';

import AddressSearchGuide from '../AddressSearchGuide';
import KoreanParagraph from '../KoreanParagraph';
import { View } from 'react-native';
import { AppearanceType } from '../../types/store';
import { getCompStyles } from '../../configs/compStyles';

interface Props {
  mode?: string;
  appearance: AppearanceType;
}

const NewCenterTip = ({ mode, appearance }: Props) => {
  const compStyles = getCompStyles(appearance);

  return (
    <>
      {mode === 'empty' && (
        <View style={compStyles.inMenuContentView}>
          <KoreanParagraph text="검색 결과가 없습니다" textStyle={compStyles.noResultText} />
          <KoreanParagraph text="구체적인 주소로 다시 검색하세요" textStyle={compStyles.noResultText} />
        </View>
      )}
      {mode === 'guide' && <AddressSearchGuide />}
    </>
  );
};

export default memo(NewCenterTip);
