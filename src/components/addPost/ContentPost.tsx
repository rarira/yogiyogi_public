import { Keyboard, KeyboardEvent, LayoutChangeEvent, Platform, StyleSheet, TextInput, View } from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import { getTheme, normalize } from '../../configs/theme';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import Icon from 'react-native-vector-icons/Ionicons';
import { SET_ADD_POST_STATE } from '../../stores/actionTypes';
import getDimensions from '../../functions/getDimensions';
import { AppearanceType } from '../../types/store';

const { SCREEN_HEIGHT, SCREEN_WIDTH, HEADER_HEIGHT, STATUS_BAR_HEIGHT } = getDimensions();

const ContentPost = ({ appearance }: { appearance: AppearanceType }) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [textInputY, setTextInputY] = useState(0);

  const {
    postStore: { postContent },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  useEffect(() => {
    const updateListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const resetListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

    const _updateKeyboardY = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const _resetKeyboardY = () => {
      setKeyboardHeight(0);
    };
    const showListener = Keyboard.addListener(updateListener, _updateKeyboardY);
    const hideListener = Keyboard.addListener(resetListener, _resetKeyboardY);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const _handleChangeText = (text: string) => {
    // if (text) {
    storeDispatch({ type: SET_ADD_POST_STATE, postContent: text });
    // }
  };

  const _handleReset = () => _handleChangeText('');

  const _handleOnLayout = (event: LayoutChangeEvent) => {
    setTextInputY(event.nativeEvent.layout.y);
  };

  const top =
    (keyboardHeight === 0 ? textInputY : keyboardHeight) +
    HEADER_HEIGHT +
    STATUS_BAR_HEIGHT +
    (Platform.OS === 'ios' ? 10 : 0);
  const height = SCREEN_HEIGHT - top;

  return (
    <View style={styles.container} onLayout={_handleOnLayout}>
      <TextInput
        placeholder="게시물 본문을 입력하세요"
        placeholderTextColor={theme.colors.placeholder}
        multiline
        value={postContent}
        onChangeText={_handleChangeText}
        autoCorrect={false}
        numberOfLines={6}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        spellCheck={false}
        scrollEnabled
        maxLength={30000}
        style={[styles.textInput, { height }]}
      />
      {!!postContent && (
        <View style={styles.deleteButton}>
          <Icon name={'md-close'} color={theme.colors.background} size={normalize(16)} onPress={_handleReset} />
        </View>
      )}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1, // marginVertical: theme.size.small,
      width: '100%',
      // marginVertical: theme.size.normal,
      // borderColor: 'red',
      // borderWidth: 1,
    },
    textInput: {
      // flex: 1,
      width: '100%',
      // borderColor: 'blue',
      // borderWidth: 1,
      padding: Platform.OS === 'android' ? 5 : 0,
      // paddingTop: theme.size.big,
      paddingTop: theme.size.medium,
      paddingBottom: theme.size.medium,
      fontSize: theme.fontSize.normal,
      textAlignVertical: 'top',
      color: theme.colors.text,
    },
    deleteButton: {
      position: 'absolute',
      top: 10,
      left: SCREEN_WIDTH - theme.size.big - normalize(40),
      width: normalize(16),
      height: normalize(16),
      backgroundColor: theme.colors.accent,
      borderRadius: normalize(8),
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default memo(ContentPost);
