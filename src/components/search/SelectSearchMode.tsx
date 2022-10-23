import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import SegmentedControlTab from 'react-native-segmented-control-tab';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  searchMode: string;
  handleSearchMode: (arg: string) => void;
  appearance: AppearanceType;
}

const SelectSearchMode = ({ searchMode, handleSearchMode, appearance }: Props) => {
  const _handleTapPress = (index: number) => {
    handleSearchMode(index === 0 ? 'all' : index === 1 ? 'simple' : 'detail');
  };

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.container}>
      <SegmentedControlTab
        values={['전체', '단어', '상세 조건']}
        selectedIndex={searchMode === 'all' ? 0 : searchMode === 'simple' ? 1 : 2}
        onTabPress={_handleTapPress}
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
      marginRight: theme.size.big,
      // marginVertical: theme.size.small,
    },
    tabTextStyle: { color: theme.colors.backdrop, fontSize: theme.fontSize.medium },
    activeTabTextStyle: { fontWeight: '600', color: theme.colors.background },
    tagText: { fontSize: theme.fontSize.medium },
    cancelButton: { marginHorizontal: 0, paddingHorizontal: 0 },
    emptyText: { fontSize: theme.fontSize.medium, color: theme.colors.placeholder },
  });

export default memo(SelectSearchMode);
