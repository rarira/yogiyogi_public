import React, { memo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { IconButton } from 'react-native-paper';
import MyChip from './MyChip';
import { String } from 'aws-sdk/clients/codebuild';
import filter from 'lodash/filter';
import { getTheme } from '../configs/theme';
import { AppearanceType } from '../types/store';

interface Props {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  isSubsScreen?: boolean;
  appearance: AppearanceType;
}

const TagChips = ({ selectedTags, setSelectedTags, isSubsScreen, appearance }: Props) => {
  const [height, setHeight] = useState(0);
  const scrollEl = useRef<ScrollView>(null);

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const cancelButton = (id: String) => {
    const _handleDeleteTag = () => {
      const newTags = filter(selectedTags, o => o !== id);
      setSelectedTags(newTags);
    };
    return (
      <IconButton
        icon="cancel"
        color={theme.colors.accent}
        size={theme.fontSize.big}
        onPress={_handleDeleteTag}
        style={styles.cancelButton}
        rippleColor="transparent"
        hitSlop={{ top: 2, left: 2, bottom: 2, right: 2 }}
      />
    );
  };

  return (
    <ScrollView
      ref={scrollEl}
      alwaysBounceVertical={false}
      contentContainerStyle={styles.container}
      onLayout={ev => setHeight(ev.nativeEvent.layout.height)}
      onContentSizeChange={(w, h) => {
        if (h >= height) {
          scrollEl!.current!.scrollToEnd({ animated: true });
        }
      }}
    >
      {selectedTags.length === 0 && (
        <Text style={styles.emptyText}>
          {isSubsScreen
            ? '구독중인 키워드가 없습니다. 리스트에서 선택 후 새로 등록하세요'
            : '선택한 키워드가 없습니다. 리스트에서 선택하세요'}
        </Text>
      )}
      {selectedTags.map((tag: string) => {
        return <MyChip name={tag} cancelButton={cancelButton} isSubsScreen={isSubsScreen} key={tag} />;
      })}
    </ScrollView>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { flexDirection: 'row', flexWrap: 'wrap' },

    tagText: { fontSize: theme.fontSize.medium },
    cancelButton: { marginHorizontal: 0, paddingHorizontal: 0 },
    emptyText: { fontSize: theme.fontSize.medium, color: theme.colors.placeholder },
  });

export default memo(TagChips);
