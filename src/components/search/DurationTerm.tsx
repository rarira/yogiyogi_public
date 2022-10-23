import { Switch } from 'react-native-paper';
import React, { memo, useState } from 'react';
import { Text, View } from 'react-native';

import { DurationTermEnum } from '../../stores/ClassStore';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';
import ThemedButton from '../ThemedButton';

interface Props {
  termDispatch: (arg: {}) => void;
  handleClose: () => void;
  durationTerm: DurationTermEnum;
}

const DurationTerm = ({ termDispatch, handleClose, durationTerm }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  const initialValue = durationTerm === DurationTermEnum.longTerm;
  const [isLongTerm, setIsLongTerm] = useState(initialValue);

  const _handleSetTerm = () => {
    termDispatch({
      type: 'setTerm',
      durationTerm: isLongTerm ? DurationTermEnum.longTerm : DurationTermEnum.shortTerm,
    });
    handleClose();
  };

  const _handleOnValueChange = () => setIsLongTerm(!isLongTerm);

  return (
    <View style={compStyles.searchContainer}>
      <View style={[compStyles.buttons, compStyles.searchTermButtons]}>
        <ThemedButton
          mode="text"
          compact
          color={theme.colors.accent}
          onPress={handleClose}
          style={compStyles.buttonMarginRight}
        >
          취소
        </ThemedButton>
        <ThemedButton mode="text" compact onPress={_handleSetTerm} disabled={isLongTerm === null}>
          선택한 기간으로 설정
        </ThemedButton>
      </View>
      <View style={compStyles.durationPicker}>
        <View style={compStyles.switchContainer}>
          <Text style={compStyles.text}>단기(대강)</Text>
          <Switch value={!isLongTerm} onValueChange={_handleOnValueChange} color={theme.colors.accent} />
        </View>
        <View style={compStyles.switchContainer}>
          <Text style={compStyles.text}>장기(정규/종료일 미지정)</Text>
          <Switch value={isLongTerm} onValueChange={_handleOnValueChange} color={theme.colors.accent} />
        </View>
      </View>
    </View>
  );
};

export default memo(DurationTerm);
