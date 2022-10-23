import React, { memo } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { getTheme, getThemeColor } from '../configs/theme';

import TextInputHelperText from './TextInputHelperText';
import { handleTextInput } from 'react-native-formik';
import { useStoreState } from '../stores/initStore';

const CustomTextInput = ({
  style,
  multiline,
  suffix,
  error,
  value,
  maxLength,
  placeholderTextColor,
  theme,
  // secureTextEntry,
  // clearButtonMode,
  ...otherProps
}: {
  [key: string]: any;
}) => {
  const styles = getThemedStyles(theme);

  // console.log(otherProps.name, style, multiline, suffix, error, value, maxLength, placeholderTextColor, otherProps);
  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          multiline={multiline}
          placeholderTextColor={placeholderTextColor || theme.colors.placeholder}
          style={[styles.inputContainer, { textAlignVertical: multiline ? 'top' : undefined }, style]}
          value={value}
          autoCorrect={false}
          autoCapitalize="none"
          // secureTextEntry={secureTextEntry}
          // clearButtonMode={clearButtonMode}
          {...otherProps}
        />
        {suffix && <Text style={styles.suffixText}>{suffix}</Text>}
      </View>
      {(error || maxLength) && <TextInputHelperText error={error ?? ''} textLength={value?.length ?? 0} maxLength={maxLength} />}
    </View>
  );
};

const MyInput: any = handleTextInput(CustomTextInput);

interface Props extends TextInputProps {
  withFormik?: boolean;
  stateError?: string;
  labelText?: string;
  [key: string]: any;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}
const SingleLineInputField = (props: Props) => {
  const { withFormik, stateError, labelText, style, containerStyle, placeholderTextColor, suffix, ...otherProps } = props;

  const {
    authStore: { appearance },
  } = useStoreState();
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  if (withFormik !== undefined && !withFormik) {
    return (
      <View style={styles.container}>
        <View style={styles.labelContainer}>{labelText && <Text style={styles.labelText}>{labelText}</Text>}</View>
        <View style={containerStyle}>
          <View style={styles.inputRow}>
            <TextInput
              placeholderTextColor={placeholderTextColor || theme.colors.placeholder}
              scrollEnabled
              style={[styles.inputContainer, { textAlignVertical: otherProps.multiline ? 'top' : undefined }, style]}
              autoCapitalize="none"
              autoCorrect={false}
              {...otherProps}
            />
            {suffix && <Text style={styles.suffixText}>{suffix}</Text>}
          </View>

          <TextInputHelperText error={stateError ?? ''} textLength={otherProps.value?.length ?? 0} maxLength={otherProps.maxLength} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>{labelText && <Text style={styles.labelText}>{labelText}</Text>}</View>
      <MyInput
        style={style}
        placeholderTextColor={placeholderTextColor}
        suffix={suffix}
        theme={theme}
        // style={[styles.inputContainer, style]}
        // textAlign={otherProps.textAlign}
        {...otherProps}
      />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.size.small,
      flexDirection: 'column',
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // borderColor: 'blue',
      // borderWidth: 1,
    },
    labelText: {
      fontSize: theme.fontSize.small,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.size.small,
    },
    inputContainer: {
      width: '100%',
      color: theme.colors.text,

      fontSize: theme.fontSize.normal,
      padding: 0,
    },
    suffixText: {
      fontSize: theme.fontSize.small,
      fontWeight: '600',
      color: theme.colors.placeholder,
      marginHorizontal: theme.size.small,
      alignItems: 'center',
    },
  });
export default memo(SingleLineInputField);
