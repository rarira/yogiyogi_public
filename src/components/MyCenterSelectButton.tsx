import { MyCenter, MyCenterItem } from '../types/store';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { RadioButton } from 'react-native-paper';

interface Props {
  setSelectedMyCenter?: (arg: MyCenter) => void;
  selected: boolean;
  item: MyCenterItem;
  theme: any;
}

const MyCenterSelectButton = ({ setSelectedMyCenter, selected, item, theme }: Props) => {
  const _handleOnPress = () => {
    if (setSelectedMyCenter) {
      setSelectedMyCenter({ id: item.center.id, address: item.center.address, name: item.center.name });
    }
  };
  return (
    <View style={styles.alignSelfCenter}>
      <RadioButton.Android
        value={item.center.id}
        status={selected ? 'checked' : 'unchecked'}
        onPress={_handleOnPress}
        color={theme.colors.accent}
        uncheckedColor={theme.colors.disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  alignSelfCenter: {
    alignSelf: 'center',
  },
});

export default memo(MyCenterSelectButton);
