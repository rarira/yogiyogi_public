import { Divider } from 'react-native-paper';
import styled from 'styled-components';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

const ThickDivider = styled(Divider)<{
  needMinusMarginHorizontal?: boolean;
  needMarginVertical?: boolean;
  noBg?: boolean;
  appearance: AppearanceType;
}>`
  margin-left: ${props => (props.needMinusMarginHorizontal ? -theme.size.big : 0)}px;
  margin-right: ${props => (props.needMinusMarginHorizontal ? -theme.size.big : 0)}px;
  margin-top: ${props => (props.needMarginVertical ? theme.size.big : 0)}px;
  margin-bottom: ${props => (props.needMarginVertical ? theme.size.big : 0)}px;
  background-color: ${props =>
    props.noBg ? getThemeColor('background', props.appearance) : getThemeColor('grey200', props.appearance)};
  height: ${theme.size.small}px;
`;

export default ThickDivider;
