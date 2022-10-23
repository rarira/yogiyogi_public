import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { List } from 'react-native-paper';
import SubHeaderText from '../SubHeaderText';
import { getTheme, getThemeColor } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  appearance: AppearanceType;
  // data: GetUserQuery['getUser'];
}

const MyPostList = ({ navigation, appearance }: Props) => {
  // const _handleNaviToBookmarkList = () => navigation.navigate('BookmarkList');
  const _handleNaviToMyPostList = () => navigation.navigate('MyPostList');

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const renderRightIcon = (iconName: string, color: string) => (props: any) => (
    <List.Icon {...props} icon={iconName} color={color} style={styles.listIcon} />
  );
  return (
    <View style={styles.container}>
      <SubHeaderText appearance={appearance}>나의 게시물</SubHeaderText>
      <List.Item
        title="등록한 게시물"
        // description="직접 등록한 클래스 리스트"
        style={styles.listItem}
        left={renderRightIcon('playlist-add', getThemeColor('indigo700', appearance))}
        onPress={_handleNaviToMyPostList}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      {/* <List.Item
        title="북마크한 게시물"
        // description="북마크한 클래스 리스트"
        style={styles.listItem}
        left={renderRightIcon('bookmark', getThemeColor('focus, appearance))}
        onPress={_handleNaviToBookmarkList}
                titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      /> */}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginVertical: theme.size.medium,
      marginHorizontal: theme.size.big,
    },
    listIcon: { margin: 0, alignSelf: 'center', padding: 0 },
    listItem: {
      width: '100%',
      padding: 0,
    },
    listItemTitle: { fontWeight: '600', color: theme.colors.text },
    listItemDescription: { fontWeight: 'normal', color: theme.colors.placeholder },
  });

export default memo(withNavigation(MyPostList));
