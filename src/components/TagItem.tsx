import { List, RadioButton } from 'react-native-paper';
import { MySnackbarAction, OPEN_SNACKBAR } from './MySnackbar';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import filter from 'lodash/filter';
// import styled from 'styled-components';
import { getTheme } from '../configs/theme';
import { AppearanceType } from '../types/store';

// const Container = styled(View)<{ indented?: boolean }>`
//   flex: 1;
//   padding-left: ${props => (props.indented ? theme.size.normal : 0)}px;
// `;

interface Props {
  item: { id: string; name: string; lastItem: boolean; subscriberCounter?: number; taggedClassCounter?: number };
  indented?: boolean;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  snackbarDispatch?: (arg: MySnackbarAction) => void;
  selectLimit: number;
  checked: boolean;
  appearance: AppearanceType;
}

const TagItem = ({
  item,
  indented,
  selectedTags,
  setSelectedTags,
  snackbarDispatch,
  selectLimit,
  checked,
  appearance,
}: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const handlePress = () => {
    if (checked) {
      if (selectLimit === 1) {
        setSelectedTags([]);
      } else {
        setSelectedTags(filter(selectedTags, o => o !== item.id));
      }
    } else if (selectedTags.length === selectLimit) {
      if (selectLimit === 1) {
        setSelectedTags([item.id]);
      } else if (snackbarDispatch) {
        snackbarDispatch({
          type: OPEN_SNACKBAR,
          message: `최대 ${selectLimit}개까지 선택 가능합니다`,
        });
      }
    } else if (!checked) {
      setSelectedTags(selectedTags.concat([item.id]));
    }
  };
  // , [selectedTags, snackbarDispatch, setSelectedTags]);

  const renderRight = () => (
    <View style={[styles.buttonContainer, ...(indented ? [{ paddingLeft: theme.size.normal }] : [])]}>
      <RadioButton.Android
        value={item.id}
        status={checked ? 'checked' : 'unchecked'}
        onPress={handlePress}
        uncheckedColor={theme.colors.disabled}
        color={theme.colors.accent}
        // radioStyle={{ height: 16, width: 16, borderRadius: 8, margin: 0 }}
        // dotStyle={{ height: 8, width: 8, borderRadius: 4 }}
        borderless={false}
      />
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <List.Item
        title={item.name}
        {...(item.subscriberCounter !== undefined && {
          description: `구독자수: ${item.subscriberCounter || 0}, 클래스수: ${item.taggedClassCounter || 0}`,
          descriptionStyle: {
            fontSize: theme.fontSize.small,
            color: theme.colors.placeholder,
          },
        })}
        {...(!item.lastItem && { style: styles.listItem })}
        titleStyle={{
          fontSize: theme.fontSize.medium,
          fontWeight: checked ? 'bold' : 'normal',
          color: theme.colors.text,
        }}
        onPress={handlePress}
        right={renderRight}
      />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    wrapper: { flex: 1, paddingLeft: 0 },
    container: { flexDirection: 'row', flexWrap: 'wrap' },
    buttonContainer: {
      marginRight: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tagText: { maxWidth: 90, fontSize: theme.fontSize.medium },
    cancelButton: { marginHorizontal: 0, paddingHorizontal: 0 },
    listItem: { borderBottomWidth: 1, borderColor: theme.colors.nearWhiteBG },
  });
export default memo(TagItem);
// , (prev, next) => prev.checked === next.checked && prev.selectedTags === next.selectedTags);
