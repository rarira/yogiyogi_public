import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { memo } from 'react';

import { ButtonProps } from 'react-native-paper';
import { getTheme } from '../configs/theme';
import { useStoreState } from '../stores/initStore';

interface Props extends Partial<ButtonProps> {
  marginHorizontalNeedless?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  color?: string;
  loading?: boolean;
}

const NextProcessButton = ({
  mode,
  children,
  onPress,
  marginHorizontalNeedless,
  buttonStyle,
  textStyle,
  containerStyle,
  color,
  loading,
  disabled,
  ...rest
}: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const theme = getTheme(appearance);
  const styles = getThemedstyles(theme);

  const marginHorizontalNeedlessStyle = { marginHorizontal: marginHorizontalNeedless ? 0 : theme.size.big };
  const isContained = mode === 'contained';
  const isDisabled = !!disabled || loading;

  // if (isDisabled) return null;

  return (
    <View style={[marginHorizontalNeedlessStyle, containerStyle]}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.registerButtonContainer,
          ...(isContained
            ? [{ backgroundColor: isDisabled ? theme.colors.disabled : color || theme.colors.primary }]
            : [{ borderColor: color || theme.colors.primary, borderWidth: 1 }]),
          buttonStyle,
          ...(isDisabled && !isContained ? [{ borderColor: theme.colors.disabled, borderWidth: 1 }] : []),
        ]}
        disabled={isDisabled}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            size={!isContained ? theme.fontSize.medium : theme.fontSize.normal}
            color={!isContained ? color || theme.colors.primary : theme.colors.background}
            style={styles.loadingContainer}
          />
        ) : (
          <Text
            style={[
              ...(!isContained
                ? [{ fontSize: theme.fontSize.medium, color: color || theme.colors.primary, fontWeight: '600' }]
                : [{ fontSize: theme.fontSize.normal, color: theme.colors.background, fontWeight: '700' }]),
              textStyle,
              ...(isDisabled && !isContained ? [{ color: theme.colors.disabled, fontWeight: '600' }] : []),
            ]}
          >
            {children || '다음'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const getThemedstyles = (theme: any) =>
  StyleSheet.create({
    registerButtonContainer: {
      // width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.size.normal,
      backgroundColor: theme.colors.background,
      marginTop: theme.size.normal,
      marginBottom: theme.size.big,
      // borderWidth: StyleSheet.hairlineWidth,
      // borderColor: theme.colors.primary,
    },
    loadingContainer: {
      marginRight: theme.size.small,
    },
  });
export default memo(NextProcessButton);
