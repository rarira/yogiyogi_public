import theme, { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import { Divider } from 'react-native-paper';
import React from 'react';
import styled from 'styled-components';
import { useStoreState } from '../stores/initStore';

interface Props {
  needMinusMarginHorizontal?: boolean;
  needMarginVertical?: boolean;
  needMarginHorizontal?: boolean;
  needMarginBottom?: boolean;
  color?: string;
}

interface MyDividerProps extends Props {
  appearance: AppearanceType;
}

const MyDivider = styled(Divider)<MyDividerProps>`
  margin-left: ${props =>
    props.needMinusMarginHorizontal ? -theme.size.big : props.needMarginHorizontal ? theme.size.big : 0}px;
  margin-right: ${props =>
    props.needMinusMarginHorizontal ? -theme.size.big : props.needMarginHorizontal ? theme.size.big : 0}px;
  margin-top: ${props => (props.needMarginVertical ? theme.size.normal : props.needMarginTop ? theme.size.small : 0)}px;
  margin-bottom: ${props => (props.needMarginVertical || props.needMarginBottom ? theme.size.normal : 0)}px;
  background-color: ${props => (props.color ? props.color : getThemeColor('placeholder', props.appearance))};
`;

const AndroidDivider = (props: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  return <MyDivider appearance={appearance} {...props} />;
};

export default AndroidDivider;
