import { CLASS_TAG_LIMIT, USER_TAG_LIMIT } from '../configs/variables';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import React, { memo, useCallback, useState } from 'react';

import { List } from 'react-native-paper';
import { MySnackbarAction } from './MySnackbar';
import TagItem from './TagItem';
import { View } from 'react-native';
import { AppearanceType } from '../types/store';
import { getTheme } from '../configs/theme';

interface Props {
  children: KeywordTagItem[];
  name: string;
  idx: number;
  expandedChunk: { idx: number; height: number } | null;
  setExpandedChunk: (arg: { idx: number; height: number } | null) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  snackbarDispatch?: (arg: MySnackbarAction) => void;
  isRegion?: boolean;
  isSubsScreen?: boolean;
  appearance: AppearanceType;
}

export interface KeywordTagItem {
  id: string;
  name: string;
  lastItem: boolean;
  subscriberCounter?: number;
  taggedClassCounter?: number;
}

const ChunkRender = ({
  children,
  name,
  idx,
  expandedChunk,
  setExpandedChunk,
  selectedTags,
  setSelectedTags,
  snackbarDispatch,
  isRegion,
  isSubsScreen,
  appearance,
}: Props) => {
  const [height, setHeight] = useState(0);
  const expanded = expandedChunk !== null && expandedChunk.idx === idx;

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _handleExpanded = () => {
    if (expanded) {
      setExpandedChunk(null);
    } else {
      setExpandedChunk({ idx, height });
    }
  };

  const _handleOnLayOut = useCallback((event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  }, []);

  return (
    <View onLayout={_handleOnLayOut}>
      <List.Accordion
        title={name}
        expanded={expanded}
        onPress={_handleExpanded}
        style={styles.accordionStyle}
        titleStyle={styles.accordionTitleStyle}
        theme={theme}
      >
        {children.map((item: KeywordTagItem) => {
          const checked = selectedTags.includes(item.id);
          return (
            <TagItem
              item={item}
              key={item.id}
              indented
              checked={checked}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              snackbarDispatch={snackbarDispatch}
              selectLimit={isSubsScreen ? USER_TAG_LIMIT : isRegion ? 1 : CLASS_TAG_LIMIT}
              appearance={appearance}
            />
          );
        })}
      </List.Accordion>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    accordionStyle: { borderBottomWidth: 1, borderColor: theme.colors.nearWhiteBG },
    accordionTitleStyle: { color: theme.colors.text },
  });

export default memo(ChunkRender);
