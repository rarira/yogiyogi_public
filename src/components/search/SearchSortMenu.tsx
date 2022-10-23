import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ClassSortType } from '../../stores/ClassStore';
import Icon from 'react-native-vector-icons/AntDesign';
import { Menu } from 'react-native-paper';
import MenuAnchorText from '../MenuAnchorText';
import { useStoreState } from '../../stores/initStore';
import { getTheme } from '../../configs/theme';

interface Props {
  setMenuVisible: (arg: boolean) => void;
  setClassSort: (arg: ClassSortType) => void;
  menuVisible: boolean;
  classSort: ClassSortType;
}

const SearchSortMenu = ({ setMenuVisible, menuVisible, setClassSort, classSort }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const theme = getTheme(appearance);

  const _handleMenuDismiss = () => setMenuVisible(false);
  const _handleMenuOpen = () => setMenuVisible(true);

  return (
    <Menu
      visible={menuVisible}
      onDismiss={_handleMenuDismiss}
      anchor={
        <TouchableOpacity onPress={_handleMenuOpen} style={styles.touchableContainer}>
          <Icon name={'downcircle'} color={theme.colors.primary} size={theme.fontSize.normal} />
          <MenuAnchorText appearance={appearance}>{classSort}</MenuAnchorText>
        </TouchableOpacity>
      }
      contentStyle={{
        backgroundColor: theme.colors.uiBackground,
      }}
    >
      <Menu.Item
        onPress={() => {
          setClassSort(ClassSortType.timeStartASC);
          setMenuVisible(false);
        }}
        title={ClassSortType.timeStartASC}
        titleStyle={{ color: theme.colors.text, fontWeight: 'bold' }}
      />
      <Menu.Item
        onPress={() => {
          setClassSort(ClassSortType.timeStartDESC);
          setMenuVisible(false);
        }}
        title={ClassSortType.timeStartDESC}
        titleStyle={{ color: theme.colors.text, fontWeight: 'bold' }}
      />
      <Menu.Item
        onPress={() => {
          setClassSort(ClassSortType.createdAtDESC);
          setMenuVisible(false);
        }}
        title={ClassSortType.createdAtDESC}
        titleStyle={{ color: theme.colors.text, fontWeight: 'bold' }}
      />
      <Menu.Item
        onPress={() => {
          setClassSort(ClassSortType.numOfClassDESC);
          setMenuVisible(false);
        }}
        title={ClassSortType.numOfClassDESC}
        titleStyle={{ color: theme.colors.text, fontWeight: 'bold' }}
      />
      <Menu.Item
        onPress={() => {
          setClassSort(ClassSortType.classFeeDESC);
          setMenuVisible(false);
        }}
        title={ClassSortType.classFeeDESC}
        titleStyle={{ color: theme.colors.text, fontWeight: 'bold' }}
      />
    </Menu>
  );
};

const styles = StyleSheet.create({
  touchableContainer: { flexDirection: 'row', alignItems: 'center' },
});

export default memo(SearchSortMenu);
