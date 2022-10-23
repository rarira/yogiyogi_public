import { FlatList, SafeAreaView } from 'react-native';
import { HeaderTitle, NavigationStackScreenProps } from 'react-navigation-stack';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { useEffect, useReducer, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import BackButton from '../components/BackButton';
import Body from '../components/Body';
import ClassCard from '../components/search/ClassCard';
import { ClassData } from '../types/apiResults';
import EmptySeparator from '../components/EmptySeparator';
import FlatListEmptyResults from '../components/FlatListEmptyResults';
import FlatListFooter from '../components/FlatListFooter';
import { HEARTS_LIMIT } from '../configs/variables';
import HeartsClearButton from '../components/HeartsClearButton';
import Left from '../components/Left';
import MyBanner from '../components/MyBanner';
import Right from '../components/Right';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import asyncCheckScreenIsFirst from '../functions/asyncCheckScreenIsFirst';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';
import { View } from 'react-native';

interface Props extends NavigationStackScreenProps {}

const HeartScreen = ({ navigation }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [heartedClassIdList, setHeartedClassIdList] = useState<string[]>([]);
  const [bannerVisible, setBannerVisible] = useState(false);

  const {
    authStore: { hearts, isFirst, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);

  const heartsCount = hearts?.count ?? 0;
  const origin = navigation.getParam('origin');

  const _handleBackButton = () => {
    if (origin) {
      navigation.navigate(origin);
    } else {
      navigation.navigate('My');
    }
  };

  useHandleAndroidBack(navigation, _handleBackButton);

  useEffect(() => {
    let _mounted = true;

    if (_mounted) {
      const check = asyncCheckScreenIsFirst('Heart', isFirst, storeDispatch);
      if (check) {
        setBannerVisible(true);
      }
    }

    return () => {
      _mounted = false;
    };
  }, []);

  useEffect(() => {
    let _mounted = true;
    if (hearts && _mounted && heartsCount !== 0) {
      const temp = { ...hearts };
      delete temp.count;
      delete temp.used;
      let tempArray = Object.keys(temp);
      setHeartedClassIdList(tempArray);
    }
    return () => {
      _mounted = false;
    };
  }, [heartsCount]);

  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body flex={5}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>관심 클래스</HeaderTitle>
        </Body>
        <Right>
          <HeartsClearButton />
        </Right>
      </SwitchStackHeader>
    );
  };

  const _keyExtractor = (item: string) => item;

  const renderItemSeparatorComponent = () => <EmptySeparator appearance={appearance} />;

  const renderItem = ({ item }: { item: string }) => {
    const heartedClass: ClassData = hearts[item];
    return <ClassCard item={heartedClass} origin={'Heart'} appearance={appearance} />;
  };

  const renderList = () => {
    return (
      <FlatList
        alwaysBounceVertical={false}
        data={heartedClassIdList}
        keyExtractor={_keyExtractor}
        keyboardShouldPersistTaps="handled"
        renderItem={renderItem}
        contentContainerStyle={styles.containerMarginVertical}
        ItemSeparatorComponent={renderItemSeparatorComponent}
        ListFooterComponent={
          <FlatListFooter
            // loading={loading}
            eolMessage="관심 클래스 리스트의 끝"
            isEmpty={heartedClassIdList.length === 0}
          />
        }
        keyboardDismissMode="on-drag"
      />
    );
  };

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={appearance} />
      {renderHeader()}
      {/* <HeartsNavBar /> */}
      <MyBanner
        message={`최대 ${HEARTS_LIMIT}개의 클래스를 관심 클래스로 구독하실 수 있습니다. 관심 클래스는 앱을 삭제하실 겅우 모두 삭제됩니다. 중요한 클래스는 북마크로 저장하세요`}
        label1="알겠습니다"
        visible={bannerVisible}
        setVisible={setBannerVisible}
      />
      <View
        style={[styles.flex1, { ...(bannerVisible && styles.opacity01) }]}
        {...(bannerVisible && { pointerEvents: 'none' })}
      >
        {heartsCount === 0 ? <FlatListEmptyResults type="관심 클래스가" /> : renderList()}
      </View>
      <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
    </SafeAreaView>
  );
};

export default HeartScreen;
