import React, { memo, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import styled from 'styled-components';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

// const activeColor = (bool: boolean) => (!bool ? theme.colors.primary : theme.colors.disabled);
// const activeFontWeight = (bool: boolean) => (!bool ? 'bold' : 'normal');

const Container = styled(View)`
  width: 100%;
  flex-direction: row;
  margin-bottom: ${theme.size.normal}px;
`;

const TabTouchableOpacity = styled(TouchableOpacity)<{ isActive: boolean; appearance: AppearanceType }>`
  flex: 1;
  border-bottom-color: ${props =>
    !props.isActive ? getThemeColor('primary', props.appearance) : getThemeColor('disabled', props.appearance)};
  border-bottom-width: 1px;
  padding: ${theme.size.small}px;
  justify-content: center;
  align-items: center;
`;
const TabText = styled(Text)<{ isActive: boolean; appearance: AppearanceType }>`
  color: ${props =>
    !props.isActive ? getThemeColor('primary', props.appearance) : getThemeColor('disabled', props.appearance)};
  font-weight: ${props => (!props.isActive ? 'bold' : 'normal')};
`;

interface Props {
  tab1Label: string;
  tab2Label: string;
  checked: boolean;
  setChecked: (arg: boolean) => void;
  appearance: AppearanceType;
}
const TabSelector = ({ tab1Label, tab2Label, checked, setChecked, appearance }: Props) => {
  const handleSetChecked = (bool: boolean) => useCallback(() => setChecked(bool), [bool]);
  return (
    <Container>
      <TabTouchableOpacity isActive={checked} onPress={handleSetChecked(false)} appearance={appearance}>
        <TabText isActive={checked} appearance={appearance}>
          {tab1Label}
        </TabText>
      </TabTouchableOpacity>
      <TabTouchableOpacity isActive={!checked} onPress={handleSetChecked(true)} appearance={appearance}>
        <TabText isActive={!checked} appearance={appearance}>
          {tab2Label}
        </TabText>
      </TabTouchableOpacity>
    </Container>
  );
};

export default memo(TabSelector);
