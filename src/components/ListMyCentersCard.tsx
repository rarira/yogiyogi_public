import { MyCenter, MyCenterItem } from '../types/store';
import React, { memo } from 'react';

import { List } from 'react-native-paper';
import MyCenterDeleteButton from './MyCenterDeleteButton';
import MyCenterSelectButton from './MyCenterSelectButton';
import { MySnackbarAction } from './MySnackbar';
import { StyleSheet } from 'react-native';

interface Props {
  item: MyCenterItem;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  username: string;
  origin: string;
  setSelectedMyCenter?: (arg: MyCenter) => void;
  selected: boolean;
  theme: any;
}

const ListMyCenterCards = ({
  item,
  snackbarDispatch,
  username,
  origin,
  selected,
  setSelectedMyCenter,
  theme,
}: Props) => {
  const styles = {
    listItem: {
      width: '100%',
      marginVertical: theme.size.small,
      borderColor: theme.colors.grey200,
      borderWidth: 1,
    },
    title: {
      color: theme.colors.text,
    },
    description: {
      color: theme.colors.placeholder,
    },
  };

  const renderRight = () => {
    switch (origin) {
      case 'MyCenter':
        return (
          <MyCenterDeleteButton item={item} snackbarDispatch={snackbarDispatch} username={username} theme={theme} />
        );
      case 'AddClass':
        return (
          <MyCenterSelectButton
            item={item}
            selected={selected}
            setSelectedMyCenter={setSelectedMyCenter}
            theme={theme}
          />
        );
    }
  };

  return (
    <List.Item
      title={item.center.name}
      description={item.center.address}
      style={styles.listItem}
      right={renderRight}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
    />
  );
};

export default memo(ListMyCenterCards);
