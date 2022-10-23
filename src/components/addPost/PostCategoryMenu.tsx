import React, { memo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import Icon from 'react-native-vector-icons/AntDesign';
import { Menu } from 'react-native-paper';
import MenuAnchorText from '../MenuAnchorText';
import { PostCategory } from '../../API';
import { SET_ADD_POST_STATE } from '../../stores/actionTypes';
import getPostCategory from '../../functions/getPostCategory';
import { getTheme } from '../../configs/theme';

const PostCategoryMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const {
    authStore: {
      appearance,
      user: { username },
    },
    postStore: { postCategory },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _handleMenuDismiss = () => setMenuVisible(false);
  const _handleMenuOpen = () => setMenuVisible(true);
  const _handleOnPress = (category: PostCategory) => () => {
    storeDispatch({ type: SET_ADD_POST_STATE, postCategory: category });
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={menuVisible}
        onDismiss={_handleMenuDismiss}
        anchor={
          <TouchableOpacity onPress={_handleMenuOpen} style={styles.touchableContainer}>
            <Text style={styles.guideText}>게시물 카테고리 선택</Text>
            <Icon name={'downcircle'} color={theme.colors.primary} size={theme.fontSize.normal} />
            <MenuAnchorText appearance={appearance}>{getPostCategory(postCategory)}</MenuAnchorText>
          </TouchableOpacity>
        }
        contentStyle={{
          backgroundColor: theme.colors.uiBackground,
        }}
      >
        <Menu.Item
          onPress={_handleOnPress(PostCategory.info)}
          title={getPostCategory(PostCategory.info)}
          titleStyle={{ color: theme.colors.text, fontWeight: 'bold' }}
        />
        <Menu.Item
          onPress={_handleOnPress(PostCategory.pr)}
          title={getPostCategory(PostCategory.pr)}
          titleStyle={{ color: theme.colors.text, fontWeight: 'bold' }}
        />
        <Menu.Item
          onPress={_handleOnPress(PostCategory.misc)}
          title={getPostCategory(PostCategory.misc)}
          titleStyle={{ color: theme.colors.text, fontWeight: 'bold' }}
        />
        {username === 'admin' && <Menu.Item onPress={_handleOnPress(PostCategory.notice)} title={getPostCategory(PostCategory.notice)} />}
      </Menu>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: theme.size.small },
    touchableContainer: { flexDirection: 'row', alignItems: 'center' },

    guideText: {
      fontSize: theme.fontSize.small,
      color: theme.colors.placeholder,
      marginRight: theme.size.normal,
    },
  });
export default memo(PostCategoryMenu);
