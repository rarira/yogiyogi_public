import { CarouselTimeOption, SET_HOME_STATE } from '../../functions/useHomeState';
import React, { Dispatch, memo } from 'react';
import { StyleSheet, View } from 'react-native';

import SegmentedControlTab from 'react-native-segmented-control-tab';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  choosedTimeOption: CarouselTimeOption;
  homeDispatch: Dispatch<any>;
  appearance: AppearanceType;
}

const SelectTimeLimit = ({ choosedTimeOption, homeDispatch, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const _handleTimeLimit = (index: number) => {
    homeDispatch({
      type: SET_HOME_STATE,
      choosedTimeOption: index === 0 ? CarouselTimeOption.ALL : CarouselTimeOption.NEW,
    });
  };

  return (
    <View style={styles.container}>
      <SegmentedControlTab
        values={['시간 제한 없음', '신규 등록 클래스만']}
        selectedIndex={choosedTimeOption === CarouselTimeOption.ALL ? 0 : 1}
        onTabPress={_handleTimeLimit}
        tabsContainerStyle={styles.tabContainerStyle}
        activeTabStyle={styles.activeTabStyle}
        tabStyle={styles.tabStyle}
        tabTextStyle={styles.tabTextStyle}
        activeTabTextStyle={styles.activeTabTextStyle}
      />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    activeTabStyle: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    tabStyle: { backgroundColor: theme.colors.background, borderColor: theme.colors.backdrop },
    tabContainerStyle: {
      marginHorizontal: theme.size.big,
      marginVertical: theme.size.small,
    },
    tabTextStyle: { color: theme.colors.backdrop },
    activeTabTextStyle: { fontWeight: '600', color: theme.colors.background },
    tagText: { fontSize: theme.fontSize.medium },
    cancelButton: { marginHorizontal: 0, paddingHorizontal: 0 },
    emptyText: { fontSize: theme.fontSize.medium, color: theme.colors.placeholder },
  });

export default memo(SelectTimeLimit);
