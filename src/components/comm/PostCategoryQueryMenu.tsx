import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import Icon from 'react-native-vector-icons/AntDesign';
import { Menu } from 'react-native-paper';
import MenuAnchorText from '../MenuAnchorText';
import { PostCategory } from '../../API';
import getPostCategory from '../../functions/getPostCategory';
import { useStoreState } from '../../stores/initStore';

interface Props {
  setQueryCategory: (arg: PostCategory | null) => void;
  queryCategory: PostCategory | null;
}

const PostCategoryQueryMenu = ({ queryCategory, setQueryCategory }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const [menuVisible, setMenuVisible] = useState(false);

  const _handleMenuDismiss = () => setMenuVisible(false);
  const _handleMenuOpen = () => setMenuVisible(true);
  const _handleOnPress = (category: PostCategory | null) => () => {
    setQueryCategory(category);
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={menuVisible}
        onDismiss={_handleMenuDismiss}
        anchor={
          <TouchableOpacity onPress={_handleMenuOpen} style={styles.touchableContainer}>
            <Icon name={'downcircle'} color={getThemeColor('primary', appearance)} size={theme.fontSize.normal} />
            <MenuAnchorText appearance={appearance}>{!!queryCategory ? getPostCategory(queryCategory) : '전체'}</MenuAnchorText>
          </TouchableOpacity>
        }
        contentStyle={{
          backgroundColor: getThemeColor('uiBackground', appearance),
        }}
      >
        <Menu.Item onPress={_handleOnPress(null)} title={'전체'} titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }} />
        <Menu.Item
          onPress={_handleOnPress(PostCategory.info)}
          title={getPostCategory(PostCategory.info)}
          titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
        />
        <Menu.Item
          onPress={_handleOnPress(PostCategory.pr)}
          title={getPostCategory(PostCategory.pr)}
          titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
        />
        <Menu.Item
          onPress={_handleOnPress(PostCategory.misc)}
          title={getPostCategory(PostCategory.misc)}
          titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
        />
        <Menu.Item
          onPress={_handleOnPress(PostCategory.notice)}
          title={getPostCategory(PostCategory.notice)}
          titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // marginBottom: theme.size.small,
    alignItems: 'center',
    // alignSelf: 'center',
  },
  touchableContainer: { flexDirection: 'row', alignItems: 'center' },
});
export default PostCategoryQueryMenu;
