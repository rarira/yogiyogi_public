import {
  ActivityIndicator,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInputContentSizeChangeEventData,
  TextInputProps,
  View,
} from 'react-native';
import { AppearanceType, CommentData } from '../types/store';
import React, { Ref, useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import theme, { getThemeColor, normalize } from '../configs/theme';

import { CommentDepth } from '../API';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';
import { useStoreState } from '../stores/initStore';

interface Props extends TextInputProps {
  text: string;
  prefix: string;
  setText: (arg: string) => void;
  handleOnPress: () => void;
  usingAccessoryView?: boolean;
  loading?: boolean;
  editComment?: CommentData;
  replyToComment?: CommentData;
  textInputEl: Ref<TextInput>;
}

const BottomStickyInput = ({
  text,
  prefix,
  setText,
  handleOnPress,
  usingAccessoryView,
  loading,
  textInputEl,
  editComment,
  replyToComment,
  ...rest
}: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  const [height, setHeight] = useState(normalize(35));
  const _handleOnChangeText = (inputText: string) => {
    setText(inputText);
  };

  const _handleOnContentSizeChange = ({ nativeEvent }: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) =>
    setHeight(nativeEvent.contentSize.height);

  const updatable = !!editComment && editComment.commentContent !== text;

  const renderTextInputComponent = (inputAccessoryViewID?: string) => (
    <View style={styles.row}>
      <TextInput
        ref={textInputEl}
        value={text}
        underlineColorAndroid="transparent"
        style={[styles.textInput, { height }]}
        multiline={true}
        autoCorrect={false}
        autoCompleteType={'off'}
        onChangeText={_handleOnChangeText}
        onContentSizeChange={_handleOnContentSizeChange}
        inputAccessoryViewID={inputAccessoryViewID}
        {...rest}
        placeholderTextColor={getThemeColor('placeholder', appearance)}
      />

      <View style={styles.inputButtons}>
        {((!editComment && !!text) || updatable) && (
          <TouchableOpacity disabled={!text || loading} style={styles.textInputButton} onPress={handleOnPress}>
            {loading ? (
              <ActivityIndicator size="small" color={getThemeColor('iosBlue', appearance)} />
            ) : (
              <Text style={styles.buttonText}>{!!editComment ? '수정' : '보내기'}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  if (usingAccessoryView) {
    const inputAccessoryViewID = 'uniqueID';

    return <>{renderTextInputComponent(inputAccessoryViewID)}</>;
  }

  return (
    <KeyboardAccessoryView androidAdjustResize alwaysVisible={true} inSafeAreaView={true} style={styles.container}>
      {!!prefix && (!!replyToComment || (!!editComment && editComment.commentDepth === CommentDepth.SUB)) && (
        <View style={styles.prefixRow}>
          <Text style={styles.prefixText}>{`@${prefix} `}</Text>
          <Text style={styles.prefixAfterText}>에게 답글 작성 중</Text>
        </View>
      )}
      {renderTextInputComponent()}
    </KeyboardAccessoryView>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: { backgroundColor: getThemeColor('uiBackground', appearance) },
    row: {
      padding: theme.size.normal,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: getThemeColor('uiBackground', appearance),
    },

    textInput: {
      flex: 1,
      maxHeight: 8 * theme.fontSize.normal,
      minHeight: theme.fontSize.subheading,
      lineHeight: theme.fontSize.big,
      fontSize: theme.fontSize.normal,
      marginRight: theme.size.small,
      textAlignVertical: 'top',
      color: getThemeColor('text', appearance),
    },

    textInputButton: {
      flexShrink: 1,
      marginRight: theme.size.small,
    },
    cancelButton: {
      flexShrink: 1,
      marginRight: theme.size.small,
    },
    buttonText: {
      fontSize: theme.fontSize.normal,
      color: getThemeColor('iosBlue', appearance),
      fontWeight: 'bold',
    },
    cancelButtonText: {
      fontSize: theme.fontSize.normal,
      color: getThemeColor('accent', appearance),
      fontWeight: 'bold',
    },
    inputButtons: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    prefixRow: {
      marginLeft: theme.size.normal,
      marginTop: theme.size.small,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    prefixAfterText: {
      fontSize: theme.fontSize.small,
      color: getThemeColor('backdrop', appearance),
    },
    prefixText: {
      fontSize: theme.fontSize.small,
      color: getThemeColor('focus', appearance),
      fontWeight: 'bold',
    },
  });

export default BottomStickyInput;
