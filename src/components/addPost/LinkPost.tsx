import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import RNUrlPreview from 'react-native-url-preview';
import { SET_ADD_POST_STATE } from '../../stores/actionTypes';
import TextInputHelperText from '../TextInputHelperText';
import isURL from 'validator/lib/isURL';
import { AppearanceType } from '../../types/store';
import { getTheme } from '../../configs/theme';

const LinkPost = ({ appearance }: { appearance: AppearanceType }) => {
  const [error, setError] = useState('');
  const {
    postStore: { postLink },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      if (!postLink) {
        storeDispatch({ type: SET_ADD_POST_STATE, thumbnailURL: undefined });
      }
    }
    return () => {
      _mounted = false;
    };
  }, [postLink]);

  const _handleChangeText = (text: string) => {
    // if (text) {
    storeDispatch({ type: SET_ADD_POST_STATE, postLink: text });
    // }
  };

  const _handleGetThumbnailURL = useCallback(
    (url: string) => {
      // if (!thumbnailURL) {
      storeDispatch({ type: SET_ADD_POST_STATE, thumbnailURL: url });
      // }
    },
    [storeDispatch],
  );

  const _handleOnEndEdit = () => {
    const check = postLink ? isURL(postLink) : false;
    if (!postLink || (check && error)) {
      setError('');
    } else if (!check && !error) {
      setError('올바른 웹사이트 주소가 아닙니다');
    }
  };

  const renderURLPreview = useMemo(() => {
    if (!error && !!postLink) {
      return (
        <RNUrlPreview text={postLink} containerStyle={styles.previewContainer} getImageLink={_handleGetThumbnailURL} />
      );
    }
  }, [error, postLink, _handleGetThumbnailURL]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="공유할 웹사이트 주소를 입력하세요(선택)"
        placeholderTextColor={theme.colors.placeholder}
        value={postLink}
        onChangeText={_handleChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        style={styles.textInput}
        onEndEditing={_handleOnEndEdit}
        // textContentType="URL"
        spellCheck={false}
      />
      {!!error && <TextInputHelperText error={error} />}
      {renderURLPreview}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.size.medium,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    previewContainer: {
      marginTop: theme.size.normal,

      // width: '100%',
      marginHorizontal: theme.size.small,
      borderColor: theme.colors.disabled,
      borderWidth: StyleSheet.hairlineWidth,
    },
    textInput: {
      // paddingTop: theme.size.small,
      width: '100%',
      fontSize: theme.fontSize.normal,
      lineHeight: theme.fontSize.big,
      color: theme.colors.text,
    },
  });

export default memo(LinkPost);
