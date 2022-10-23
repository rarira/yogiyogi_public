import React, { memo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { SET_ADD_POST_STATE } from '../../stores/actionTypes';
import TextInputHelperText from '../TextInputHelperText';
import { getTheme } from '../../configs/theme';

const MAX_LENGTH = 40;

const TitlePost = () => {
  const [error, setError] = useState('');
  const {
    postStore: { postTitle },
    authStore: { appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _handleChangeText = (text: string) => {
    // if (text) {
    storeDispatch({ type: SET_ADD_POST_STATE, postTitle: text });
    // }
  };

  const _handleOnEndEdit = () => {
    if (postTitle && error) {
      setError('');
    } else if (!postTitle && !error) {
      setError('제목은 필수입니다');
    } else if (postTitle.length < 5 && !error) {
      setError('제목은 5자 이상 입력하세요');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="게시물 제목을 입력하세요"
        placeholderTextColor={theme.colors.placeholder}
        value={postTitle}
        onChangeText={_handleChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        maxLength={MAX_LENGTH}
        clearButtonMode="while-editing"
        style={styles.textInput}
        onEndEditing={_handleOnEndEdit}
        // textContentType="URL"
        spellCheck={false}
      />
      <TextInputHelperText error={error} textLength={postTitle.length} maxLength={MAX_LENGTH} />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.size.small,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    textInput: {
      paddingTop: theme.size.small,
      width: '100%',
      fontSize: theme.fontSize.normal,
      lineHeight: theme.fontSize.big,
      color: theme.colors.text,
    },
  });

export default memo(TitlePost);
