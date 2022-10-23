import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { AppearanceType } from '../types/store';
import { getTheme } from '../configs/theme';

interface Props {
  isHearted: boolean;
  onPress(): void;
  size?: number;
  appearance: AppearanceType;
}

const ClassHeartButton = ({ isHearted, onPress, size, appearance }: Props) => {
  const theme = getTheme(appearance);

  return (
    <TouchableOpacity onPress={onPress}>
      {isHearted ? (
        <Icon name="heart" color={theme.colors.accent} size={size || 32} />
      ) : (
        <Icon name="heart-outline" color={theme.colors.background} size={size || 32} />
      )}
    </TouchableOpacity>
  );
};

export default React.memo(ClassHeartButton);
