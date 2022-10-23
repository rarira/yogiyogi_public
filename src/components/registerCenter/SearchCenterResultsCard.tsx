import React, { memo } from 'react';

import { AppearanceType, Center } from '../../types/store';
import { List } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { getThemeColor } from '../../configs/theme';

interface Props {
  item: Center;
  getItemProps: any;
  selectedItem: Center;
  appearance: AppearanceType;
}

const SearchCenterResultsCard = ({ item, selectedItem, getItemProps, appearance }: Props) => {
  const titleStyle = {
    fontWeight: item === selectedItem ? 'bold' : 'normal',
    color: getThemeColor('text', appearance),
  };
  const descriptionStyle = {
    color: getThemeColor('placeholder', appearance),
  };
  return (
    <TouchableOpacity
      {...getItemProps({
        item,
      })}
    >
      <List.Item
        titleStyle={titleStyle}
        title={item.place_name}
        description={item.road_address_name || item.address_name}
        descriptionStyle={descriptionStyle}
      />
    </TouchableOpacity>
  );
};

export default memo(SearchCenterResultsCard);
