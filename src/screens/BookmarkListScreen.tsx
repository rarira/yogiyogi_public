import { Dimensions, SafeAreaView as NativeSafeAreaView } from 'react-native';
import { NavigationState, Route, TabBar, TabView } from 'react-native-tab-view';
import React, { memo, useCallback, useState } from 'react';

import BackButton from '../components/BackButton';
import Body from '../components/Body';
import BookmarkClearButton from '../components/BookmarkClearButton';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import MyBookmarkedClassList from '../components/My/MyBookmarkedClassList';
import MyBookmarkedPostList from '../components/My/MyBookmarkedPostList';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import Right from '../components/Right';
import { SafeAreaView } from 'react-navigation';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';

import { getThemeColor } from '../configs/theme';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';

// import useHandleAndroidBack from '../functions/handleAndroidBack';

interface Props extends NavigationStackScreenProps {}

export enum MyBookmaredListTab {
  Class = '클래스',
  Post = '게시물',
}

const BookmarkListScreen = ({ navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getStyles(appearance);

  let routes = [
    // { key: 'class', title: MyBookmaredListTab.Class },
    { key: 'post', title: MyBookmaredListTab.Post },
  ];

  const [tabViewState, setTabViewState] = useState<NavigationState<Route>>({ index: 0, routes });

  const _handleBackButton = () => {
    navigation.goBack();
  };

  // useHandleAndroidBack(navigation, _handleBackButton);

  const _handleIndexChange = (index: number) => setTabViewState({ index, routes: tabViewState.routes });

  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body flex={5}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>북마크 리스트</HeaderTitle>
        </Body>
        <Right>
          <BookmarkClearButton index={tabViewState.index} />
        </Right>
      </SwitchStackHeader>
    );
  };

  const BookmarkedClassList = <MyBookmarkedClassList />;
  const BookmarkedPostList = <MyBookmarkedPostList />;

  const renderTabBar = useCallback(
    (props: any) => {
      return (
        <TabBar
          {...props}
          indicatorStyle={styles.tabBarIndicatorStyle}
          activeColor={getThemeColor('primary', appearance)}
          inactiveColor={getThemeColor('placeholder', appearance)}
          style={styles.tabBarStyle}
        />
      );
    },
    [appearance],
  );

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={appearance} />
      {renderHeader()}
      <NativeSafeAreaView style={styles.contentContainerView}>
        <TabView
          navigationState={tabViewState}
          onIndexChange={_handleIndexChange}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'class':
                return BookmarkedClassList;
              case 'post':
                return BookmarkedPostList;
              default:
                return null;
            }
          }}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={renderTabBar}
          swipeEnabled={true}
        />
      </NativeSafeAreaView>
    </SafeAreaView>
  );
};

export default memo(BookmarkListScreen);
