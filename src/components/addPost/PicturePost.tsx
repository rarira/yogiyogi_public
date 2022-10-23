import React, { memo, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getTheme, normalize } from '../../configs/theme';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { Image } from 'react-native-image-crop-picker';
import KoreanParagraph from '../KoreanParagraph';
import { MAX_FILES_PER_POST } from '../../configs/variables';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { SET_ADD_POST_STATE } from '../../stores/actionTypes';
import { TouchableOpacity } from 'react-native-gesture-handler';
import compact from 'lodash/compact';
import openImagePickerActionSheet from '../../functions/openImagePickerActionSheet';
import produce from 'immer';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { AppearanceType } from '../../types/store';

const PicturePost = ({ appearance }: { appearance: AppearanceType }) => {
  const [pic, setPic] = useState<Image | null>(null);
  const {
    postStore: { postPictureKeys, toRemovePicture, updateMode, postPicture },
  } = useStoreState();

  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    let _mounted = true;
    if (_mounted && !!pic) {
      const tempStore = postPictureKeys.concat([pic.path]);

      storeDispatch({ type: SET_ADD_POST_STATE, postPictureKeys: tempStore });
    }
    return () => {
      _mounted = false;
      // ImagePicker.clean()
      //   .then(() => {
      //     console.log('removed all tmp images from tmp directory');
      //   })
      //   .catch(e => {
      //     console.log(e);
      //   });
    };
  }, [pic]);
  const originalPictureLength = !!postPicture ? postPicture.length : undefined;
  const compactPictureKeys = compact(postPictureKeys);

  const _handleOnPress = () => {
    // if (compactPictureKeys.length < MAX_FILES_PER_POST) {
    openImagePickerActionSheet({
      width: 600,
      height: 600,
      // maxFiles: MAX_FILES_PER_POST - pics.length,
      showActionSheetWithOptions,
      setPic,
      appearance,
    })();
    // }
  };

  const _handleDeletePic = (index: number) => () => {
    const deleteIndex = (val: any, idx: number) => index !== idx;
    if (!updateMode) {
      const nextPostPictureKeys = produce(postPictureKeys, (draft: Array<string | null>) => draft.filter(deleteIndex));
      storeDispatch({
        type: SET_ADD_POST_STATE,
        postPictureKeys: nextPostPictureKeys,
      });
    } else {
      if (originalPictureLength !== undefined && index < originalPictureLength) {
        const nextToRemovePicture = toRemovePicture.concat([index]);
        const nextPostPictureKeys = produce(postPictureKeys, (draft: Array<string | null>) => {
          draft[index] = null;
        });
        storeDispatch({
          type: SET_ADD_POST_STATE,
          postPictureKeys: nextPostPictureKeys,
          toRemovePicture: nextToRemovePicture,
        });
      } else {
        const nextPostPictureKeys = produce(postPictureKeys, (draft: Array<string | null>) =>
          draft.filter(deleteIndex),
        );
        storeDispatch({
          type: SET_ADD_POST_STATE,
          postPictureKeys: nextPostPictureKeys,
        });
      }
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.photoButton}
        onPress={_handleOnPress}
        disabled={compactPictureKeys.length >= MAX_FILES_PER_POST}
      >
        <MaterialIcon name="photo-camera" color={theme.colors.placeholder} size={theme.iconSize.big} />
        <Text style={styles.numberText}>
          {compactPictureKeys.length} / {MAX_FILES_PER_POST}
        </Text>
      </TouchableOpacity>
      {compactPictureKeys.length === 0 && (
        <KoreanParagraph
          text={`사진을 ${MAX_FILES_PER_POST}장 까지 첨부하실 수 있습니다(선택). 가급적 공유할 웹사이트 주소나 사진 중 하나는 입력해 주세요`}
          textStyle={styles.guideText}
          paragraphStyle={styles.guideParagraph}
        />
      )}
      {compactPictureKeys.length > 0 && (
        <ScrollView alwaysBounceHorizontal={false} horizontal contentContainerStyle={styles.imagesContainer}>
          {postPictureKeys.map((image: string | null, index: number) => {
            if (!image) return null;
            return (
              <TouchableOpacity
                key={index}
                onPress={_handleDeletePic(index)}
                hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
              >
                <View style={styles.imageContainer}>
                  <FastImage source={{ uri: image }} style={styles.imageThumbnail} />
                  <View style={styles.deleteButton}>
                    <Icon name={'md-close'} color={theme.colors.background} size={normalize(16)} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};
const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.size.big,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    imagesContainer: {
      paddingRight: normalize(50),
      width: 'auto',
    },
    photoButton: {
      height: theme.iconSize.thumbnail,
      width: theme.iconSize.thumbnail,
      borderColor: theme.colors.placeholder,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: normalize(5),
      backgroundColor: theme.colors.background,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.size.small,
    },
    numberText: {
      color: theme.colors.placeholder,
      fontSize: theme.fontSize.small,
      fontWeight: 'normal',
    },
    imageContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: theme.iconSize.thumbnail,
      width: theme.iconSize.thumbnail,
      marginHorizontal: theme.size.small,
      // borderColor: 'red',
      // borderWidth: 1,
    },
    imageThumbnail: {
      height: theme.iconSize.thumbnail - normalize(10),
      width: theme.iconSize.thumbnail - normalize(10),
    },
    deleteButton: {
      position: 'absolute',
      top: 0,
      left: theme.iconSize.thumbnail - normalize(16),
      width: normalize(16),
      height: normalize(16),
      backgroundColor: theme.colors.error,
      borderRadius: normalize(8),
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: theme.colors.background,
      fontSize: theme.fontSize.big,
    },
    guideText: {
      color: theme.colors.backdrop,
      fontSize: theme.fontSize.small,
    },
    guideParagraph: {
      flex: 1,
      marginHorizontal: theme.size.normal,
      // borderColor: 'red',
      // borderWidth: 1,
    },
  });

export default memo(PicturePost);
