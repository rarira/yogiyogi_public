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

const MyClassList = ({ navigation, appearance }: Props) => {
  // const _handleNaviToBookmarkList = () => navigation.navigate('BookmarkList');
  const _handleNaviToHeartList = () => navigation.navigate('Heart');
  const _handleNaviToClassList = (type: string) => () => navigation.navigate('ClassList', { type });
  const renderRightIcon = (iconName: string, color: string) => (props: any) => (
    <List.Icon {...props} icon={iconName} color={color} style={styles.listIcon} />
  );

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.container}>
      <SubHeaderText appearance={appearance}>나의 클래스</SubHeaderText>

      <List.Item
        title="호스트 클래스"
        description="구인 등록한 클래스 리스트"
        style={styles.listItem}
        left={renderRightIcon('playlist-add', getThemeColor('indigo700', appearance))}
        onPress={_handleNaviToClassList('hosted')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      <List.Item
        title="담당 클래스"
        description="선생님을 담당한 리스트"
        style={styles.listItem}
        left={renderRightIcon('playlist-add-check', getThemeColor('notification', appearance))}
        onPress={_handleNaviToClassList('proxied')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />

      <List.Item
        title="리뷰할 클래스"
        description="호스트/선생님 리뷰 작성할 클래스 리스트"
        style={styles.listItem}
        left={renderRightIcon('rate-review', getThemeColor('primary', appearance))}
        onPress={_handleNaviToClassList('toReview')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      {/* <List.Item
        title="북마크한 클래스"
        description="북마크한 클래스 리스트"
        style={styles.listItem}
        left={renderRightIcon('bookmark', getThemeColor('focus', appearance))}
        onPress={_handleNaviToBookmarkList}
                titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      /> */}
      <List.Item
        title="관심 클래스"
        description="관심 클래스 리스트"
        style={styles.listItem}
        left={renderRightIcon('favorite', getThemeColor('red', appearance))}
        onPress={_handleNaviToHeartList}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
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

export default memo(withNavigation(MyClassList));
