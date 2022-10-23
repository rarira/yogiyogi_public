import { ScrollView, Text, View } from 'react-native';

import AndroidDivider from '../components/AndroidDivider';
import BackButton from '../components/BackButton';
import Body from '../components/Body';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import React from 'react';
import Right from '../components/Right';
import SubHeaderText from '../components/SubHeaderText';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { TOTAL_MANNERS } from '../configs/variables';
import ThickDivider from '../components/ThickDivider';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';

interface Props extends NavigationStackScreenProps {}

const MannersListScreen = ({ navigation }: Props) => {
  const {
    authStore: {
      user: { username },
      appearance,
    },
  } = useStoreState();
  const styles = getStyles(appearance);

  const manners: [string, number][] = navigation.getParam('manners');
  const userName = navigation.getParam('userName');
  const userId = navigation.getParam('userId');
  const privacySetting = navigation.getParam('privacySetting');

  let goodManners: [string, number][] = [];
  let badManners: [string, number][] = [];

  manners.forEach(value => {
    if (value[0].startsWith('g')) {
      goodManners.push(value);
    } else {
      badManners.push(value);
    }
  });

  const _handleBackButton = () => navigation.goBack();

  useHandleAndroidBack(navigation, _handleBackButton);

  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body flex={5}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>매너 리뷰 상세</HeaderTitle>
        </Body>
        <Right></Right>
      </SwitchStackHeader>
    );
  };

  const renderMannerList = (manner: [string, number], index: number, arr: [string, number][]) => {
    const badManner = manner[0].startsWith('bm');
    const isMyself = username === userId;

    return (
      <View key={manner[0]}>
        <View style={styles.listRow}>
          <Text style={styles.fontMedium}>{index + 1}. </Text>
          {badManner && !privacySetting && !isMyself ? (
            <Text style={[styles.fontMedium, styles.justifyContentFlexStart, styles.fontDisabled]}>
              {userName} 님이 내용 공개를 거부했습니다
            </Text>
          ) : (
            <Text style={[styles.fontMedium, styles.justifyContentFlexStart]}>{TOTAL_MANNERS[manner[0]].text}</Text>
          )}
          <Text style={[styles.fontMedium, styles.weightedFont]}>{manner[1]}건</Text>
        </View>
        {index !== arr.length - 1 && <AndroidDivider />}
      </View>
    );
  };

  return (
    <ModalScreenContainer
      children1={
        <>
          {renderHeader()}
          <ScrollView
            contentContainerStyle={[
              styles.contentContainerView,
              styles.screenMarginHorizontal,
              styles.paddingMediumVertical,
            ]}
            alwaysBounceVertical={false}
          >
            <SubHeaderText appearance={appearance}>좋은 매너 평가</SubHeaderText>
            {goodManners.map(renderMannerList)}

            <ThickDivider noBg needMarginVertical appearance={appearance} />
            <SubHeaderText appearance={appearance}>비매너 평가</SubHeaderText>
            {badManners.map(renderMannerList)}
          </ScrollView>
        </>
      }
    />
  );
};

export default MannersListScreen;
