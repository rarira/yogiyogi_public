import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import theme, { getThemeColor } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  noPicture: boolean;
  appearance: AppearanceType;
}

const UpdateProfilePictureButton = ({ noPicture, appearance }: Props) => {
  const buttonProps = {
    color: noPicture ? getThemeColor('accent', appearance) : getThemeColor('primary', appearance),
    text: noPicture ? '프로필 사진 업로드(필수)' : '프로필 사진 변경',
  };

  return <Text style={[styles.classButtonText, { color: buttonProps.color }]}>{buttonProps.text}</Text>;
};

const styles = StyleSheet.create({
  classButtonText: { fontSize: theme.fontSize.medium, fontWeight: '600', marginTop: theme.size.small },
});

export default memo(UpdateProfilePictureButton);
