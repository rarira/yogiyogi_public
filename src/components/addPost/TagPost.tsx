import React, { Ref, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { IconButton } from 'react-native-paper';
import MyChip from '../MyChip';
import RBSheet from 'react-native-raw-bottom-sheet';
import { SET_ADD_POST_STATE } from '../../stores/actionTypes';
import { getTheme } from '../../configs/theme';

interface TagPostProps {
  bottomSheetEl: Ref<RBSheet>;
}

const TagPost = ({ bottomSheetEl }: TagPostProps) => {
  const {
    postStore: { postTags },
    authStore: { appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const cancelButton = (id: String) => {
    const _handleCancelButton = () => {
      let nextPostTags: string[];

      nextPostTags = postTags.filter((item: string) => item !== id);
      storeDispatch({ type: SET_ADD_POST_STATE, postTags: nextPostTags });
    };
    return (
      <IconButton
        icon="cancel"
        color={theme.colors.accent}
        size={theme.fontSize.big}
        onPress={_handleCancelButton}
        style={styles.cancelButton}
        rippleColor="transparent"
        hitSlop={{ top: 2, left: 2, bottom: 2, right: 2 }}
      />
    );
  };

  const _handleOpenSheet = useCallback(() => bottomSheetEl!.current!.open(), [bottomSheetEl]);

  return (
    <ScrollView alwaysBounceHorizontal={false} contentContainerStyle={styles.container} horizontal={true}>
      {postTags.length === 0 && (
        <TouchableOpacity onPress={_handleOpenSheet}>
          <Text style={styles.emptyText}>관련 있는 키워드를 등록하세요(선택)</Text>
        </TouchableOpacity>
      )}
      {postTags.map((tag: string) => {
        const choosed = false;

        return (
          <MyChip
            name={tag}
            key={tag}
            cancelButton={cancelButton}
            onPress={_handleOpenSheet}
            choosed={choosed}
            fullName
          />
        );
      })}
    </ScrollView>
  );
};

export default TagPost;

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { marginVertical: theme.size.medium },
    cancelButton: { marginHorizontal: 0, paddingHorizontal: 0 },

    emptyText: { fontSize: theme.fontSize.normal, color: theme.colors.placeholder },
  });
