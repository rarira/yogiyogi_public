import { StyleSheet, View } from 'react-native';
import theme, { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import styled from 'styled-components';

const SwitchStackHeader = styled(View)<{
  border?: boolean;
  backgroundColor?: string;
  paddingNeedles?: boolean;
  thick?: boolean;
  appearance?: AppearanceType;
}>`
  flex-direction: row;

  height: ${props =>
    props.thick ? theme.iconSize.smallThumbnail + theme.fontSize.small : theme.iconSize.smallThumbnail}px;
  margin-top: ${theme.size.small}px;
  padding-bottom: 0;
  padding-right: 0;
  padding-right: ${props => (props.paddingNeedles ? 0 : theme.size.big)}px;
  padding-left: ${props => (props.paddingNeedles ? 0 : theme.size.big)}px;
  border-bottom-color: ${props => getThemeColor('grey200', props.appearance)};
  border-bottom-width: ${props => (props.border ? StyleSheet.hairlineWidth : 0)}px;
  background-color: ${props =>
    props.backgroundColor ? props.backgroundColor : getThemeColor('background', props.appearance)};
  border-top-left-radius: ${theme.size.medium}px;
  border-top-right-radius: ${theme.size.medium}px;
`;

// height: ${props => (props.thick ? normalize(38) + theme.fontSize.small : normalize(38))}px;
export default SwitchStackHeader;
