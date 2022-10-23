import React, { memo } from 'react';

import { List } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { getThemeColor } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  item: any;
  getItemProps: any;
  selectedItem: any;
  appearance: AppearanceType;
}

const NewCenterResultsCard = ({ item, selectedItem, getItemProps, appearance }: Props) => {
  const titleStyle = {
    fontWeight: item === selectedItem ? 'bold' : 'normal',
    color: getThemeColor('text', appearance),
  };
  return (
    <TouchableOpacity
      {...getItemProps({
        item,
      })}
    >
      <List.Item titleStyle={titleStyle} title={item.address_name} />
    </TouchableOpacity>
  );
};

export default memo(NewCenterResultsCard);
