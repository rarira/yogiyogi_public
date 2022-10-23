import { ActivityIndicator } from 'react-native';
import React, { memo } from 'react';

import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getTheme } from '../configs/theme';
import { AppearanceType } from '../types/store';

interface Props {
  handleOnPress: () => void;
  disabled?: boolean;
  exit?: boolean;
  big?: boolean;
  needMarginLeft?: boolean;
  loading?: boolean;
  appearance: AppearanceType;
}

const DeleteButton = ({ handleOnPress, disabled, exit, big, needMarginLeft, loading, appearance }: Props) => {
  const getHitSlop = () => {
    const range = big ? 8 : 5;
    return { top: range, left: range, bottom: range, right: range };
  };
  const theme = getTheme(appearance);

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={handleOnPress}
      hitSlop={getHitSlop()}
      style={{ marginLeft: needMarginLeft ? theme.size.big : 0 }}
    >
      {loading ? (
        <ActivityIndicator
          size={theme.fontSize.medium}
          // color={theme.colors.}
          style={{
            marginRight: theme.size.small,
          }}
        />
      ) : (
        <Icon
          name={exit ? 'md-exit' : 'md-close'}
          color={disabled ? theme.colors.disabled : big ? theme.colors.placeholder : theme.colors.red}
          size={big ? theme.iconSize.big : theme.fontSize.normal}
        />
      )}
    </TouchableOpacity>
  );
};

// const styles = StyleSheet.create({
//   loadingContainer: {
//     marginRight: theme.size.small,
//   },
// });
export default memo(DeleteButton);
