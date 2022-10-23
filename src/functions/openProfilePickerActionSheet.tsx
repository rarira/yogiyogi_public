import ImagePicker, { Image } from 'react-native-image-crop-picker';

import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { Dispatch } from 'react';
import { getCompStyles } from '../configs/compStyles';
import { AppearanceType } from '../types/store';

interface Args {
  width: number;
  height: number;

  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void;
  dispatch: Dispatch<any>;
  appearance: AppearanceType;
}

const openProfilePictureActionSheet = ({
  width,
  height,
  showActionSheetWithOptions,
  dispatch,
  appearance,
}: Args) => () => {
  const compStyles = getCompStyles(appearance);

  const _handleImageCropped = (image: Image | Image[]) =>
    dispatch({
      type: 'updateState',
      profilePicture: image instanceof Array ? image[0].path : image.path,
      pictureUpdated: true,
      updated: true,
    });

  const _handleOpenPicker = () =>
    ImagePicker.openPicker({
      width,
      height,
      cropping: true,
      forceJpg: true,
    })
      .then(_handleImageCropped)
      .catch(e => console.log(e));

  const _handleOpenCamera = () =>
    ImagePicker.openCamera({
      width,
      height,
      cropping: true,
      forceJpg: true,
    })
      .then(_handleImageCropped)
      .catch(e => console.log(e));

  const actions = {
    openPicker: {
      text: '사진 앨범에서 선택',
      callback: _handleOpenPicker,
    },
    openCamera: {
      text: '카메라 촬영',
      callback: _handleOpenCamera,
    },
  };

  // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  const options = [actions.openPicker.text, actions.openCamera.text, '닫기'];
  const cancelButtonIndex = options.length - 1;

  if (options.length === 1) return null;

  showActionSheetWithOptions(
    {
      options,
      cancelButtonIndex,
      showSeparators: true,
      textStyle: compStyles.actionSheetTextStyle,
      separatorStyle: compStyles.actionSheetSeparatorStyle,
      containerStyle: compStyles.actionSheetContainerStyle,
    },
    async buttonIndex => {
      if (options[buttonIndex] === actions.openPicker.text) {
        await actions.openPicker.callback();
      }
      if (options[buttonIndex] === actions.openCamera.text) {
        await actions.openCamera.callback();
      }

      // Do something here depending on the button index selected
    },
  );
};

export default openProfilePictureActionSheet;
