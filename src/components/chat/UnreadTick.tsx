import { View } from 'react-native';
import styled from 'styled-components';
import theme, { getThemeColor } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

const UnreadTick = styled(View)<{ needMarginRight?: boolean; appearance: AppearanceType }>`
  height: ${theme.size.normal}px;
  width: ${theme.size.normal}px;
  background-color: ${props => getThemeColor('notification', props.appearance)};
  border-radius: ${theme.size.normal / 2}px;
  margin-right: ${props => (props.needMarginRight ? theme.size.small : 0)}px;
`;

export default UnreadTick;
